/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventVolunteer } from 'src/event-volunteers/entities/event-volunteer.entity';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger(ChatGateway.name);

  constructor(
    private chatService: ChatService,
    @InjectRepository(EventVolunteer)
    private evRepo: Repository<EventVolunteer>,
    private jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.auth?.token;
      if (!authHeader) throw new Error('No token');

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      const payload = this.jwtService.verify(token, {
        secret: jwtConstants.secret,
      });

      (client as any).user = payload;

      this.logger.log(`✅ Client connected: ${payload.email} (${client.id})`);

      // Log all events from this client
      client.onAny((eventName, ...args) => {
        this.logger.log(`🎯 Event received: ${eventName}`, args);
      });
    } catch (err) {
      this.logger.warn(`❌ Client connection failed: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${(client as any).user?.email}`);
  }

  @SubscribeMessage('joinEvent')
  async joinEvent(
    @MessageBody() data: { eventId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) return client.disconnect();

    this.logger.log('=======================');
    this.logger.log(user);

    // Check if the user is the owner (creator) of the event
    const isOwner = await this.evRepo.manager
      .getRepository('Event')
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.created_by', 'creator')
      .where('event.id = :eventId', { eventId: data.eventId })
      .andWhere('creator.id = :userId', { userId: user.sub })
      .getOne();

    // Check if the user is a volunteer for this event
    const isVolunteer = await this.evRepo
      .createQueryBuilder('ev')
      .leftJoin('ev.event', 'event')
      .leftJoin('ev.volunteer', 'volunteer')
      .leftJoin('volunteer.user', 'volUser')
      .where('event.id = :eventId', { eventId: data.eventId })
      .andWhere('volUser.id = :userId', { userId: user.sub })
      .getOne();

    if (!isOwner && !isVolunteer) {
      client.emit('error', {
        message:
          'Access denied: You are not a volunteer or owner of this event',
      });
      this.logger.warn(
        `Access denied: User ${user.email} tried to join event:${data.eventId} without proper access`,
      );
      return client.disconnect();
    }

    void client.join(`event:${data.eventId}`);
    client.emit('joined', { eventId: data.eventId });
    this.logger.log(`User ${user.email} joined event:${data.eventId}`);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log('📥 sendMessage event received');
    this.logger.log(`📦 Payload: ${JSON.stringify(dto)}`);

    const user = (client as any).user;
    this.logger.log(`👤 User: ${JSON.stringify(user) || 'undefined'}`);

    if (!user) {
      this.logger.error('❌ No user found, disconnecting');
      return client.disconnect();
    }

    const volunteer = await this.evRepo.findOne({
      where: {
        event: { id: dto.eventId },
        volunteer: { user: { id: user.sub } },
      },
      relations: ['volunteer', 'event'],
    });

    try {
      const message = await this.chatService.saveMessage(
        dto.eventId,
        user.sub as number,
        dto.content,
        volunteer?.volunteer.id,
      );

      this.logger.log(`💾 Message saved: ${message.id}`);

      const payload = {
        ...message,
      };

      this.logger.log(`📤 Emitting to room: event:${dto.eventId}`);
      this.server.to(`event:${dto.eventId}`).emit('message', payload);
      this.logger.log('✅ Message emitted successfully');
    } catch (error) {
      this.logger.error(`❌ Error in sendMessage: ${error.message}`);
      client.emit('error', { message: 'Failed to send message' });
    }
  }
}

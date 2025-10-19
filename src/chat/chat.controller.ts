import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':eventId')
  async sendMessage(
    @Param('eventId') eventId: number,
    @Body('senderId') senderId: number,
    @Body('content') content: string,
    @Body('volunteerId') volunteerId?: number,
  ) {
    return this.chatService.saveMessage(
      eventId,
      senderId,
      content,
      volunteerId,
    );
  }

  @Get(':eventId')
  async getMessages(@Param('eventId') eventId: number) {
    return this.chatService.getMessagesForEvent(eventId);
  }
}

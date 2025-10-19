/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  Param,
  Get,
  Res,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { EventResourcesService } from './event-resources.service';
import { CreateEventResourceDto } from './dto/create-event-resource.dto';
import { extname } from 'path';
import express from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('event-resources')
export class EventResourcesController {
  constructor(private readonly resourceService: EventResourcesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { eventId: number },
    @Req() req,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!body.eventId) throw new BadRequestException('Event ID is required');

    const uploader = req.user;
    if (!uploader) throw new BadRequestException('User not authenticated');

    const dto: CreateEventResourceDto = {
      eventId: Number(body.eventId),
      name: file.originalname,
      path: file.filename,
      size: file.size,
      mimeType: file.mimetype,
    };

    return this.resourceService.create(dto, uploader);
  }

  @Get('list/:eventId')
  findAllByEvent(@Param('eventId') eventId: string) {
    return this.resourceService.list(Number(eventId));
  }

  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: express.Response) {
    const resource = await this.resourceService.findOne(Number(id));
    if (!resource) throw new NotFoundException('Resource not found');

    const filePath = `./uploads/${resource.path}`;
    res.setHeader(
      'Content-Type',
      resource.mimeType || 'application/octet-stream',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${resource.name}"`,
    );

    res.download(filePath, resource.name, (err) => {
      if (err) throw new NotFoundException('File not found');
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    return this.resourceService.remove(Number(id), req.user);
  }
}

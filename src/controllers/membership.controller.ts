import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MembershipService } from '../services/membership.service';
import { CreateMembershipDto } from '../dtos/membership.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Membership')
@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get list of all memberships' })
  findAll() {
    return this.membershipService.findAll();
  }

  @Get(':rank')
  @ApiOperation({ summary: 'Get membership by rank' })
  findByRank(@Param('rank') rank: string) {
    return this.membershipService.findByRank(rank);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new membership' })
  create(@Body() dto: CreateMembershipDto) {
    return this.membershipService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update membership by ID' })
  update(@Param('id') id: number, @Body() dto: CreateMembershipDto) {
    return this.membershipService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete membership by ID' })
  remove(@Param('id') id: number) {
    return this.membershipService.remove(id);
  }
}

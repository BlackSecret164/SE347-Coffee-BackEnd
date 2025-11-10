import { Body, Controller, Get, Headers, Post, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { StaffSigninDto, RegisterCustomerDto } from '../dtos/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  registerCustomer(@Body() dto: RegisterCustomerDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('signin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đăng nhập (staff hoặc customer)' })
  async signin(@Body() dto: StaffSigninDto) {
    return this.authService.signin(dto);
  }

  @Get('callback')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Callback: trả thông tin user và ghi log' })
  async callback(@Headers('Authorization') authHeader: string) {
    return this.authService.callback(authHeader);
  }
}

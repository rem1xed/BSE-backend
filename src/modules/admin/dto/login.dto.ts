import { LoginDto } from "../../auth/dto/login.dto";
export interface AdminLoginDto extends LoginDto {
  key: string;
}
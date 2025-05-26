import { RegisterDto } from "../../auth/dto/register.dto";
export interface AdminRegisterDto extends RegisterDto {
  key: string;
}
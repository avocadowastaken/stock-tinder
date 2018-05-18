import { Exclude, Expose, Transform } from "class-transformer";

import { BaseDTO } from "./BaseDTO";
import { trim } from "lodash-es";

@Exclude()
export class UserDTO extends BaseDTO {
  public constructor(values: UserDTO) {
    super(values);
  }

  @Expose() public id: string;
  @Expose()
  @Transform(x => (!x ? undefined : trim(x)))
  public username?: string;
}

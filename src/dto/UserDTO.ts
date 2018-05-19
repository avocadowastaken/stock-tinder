import { Exclude, Expose, Transform } from "class-transformer";
import { trim } from "lodash-es";

import { BaseDTO } from "./BaseDTO";

@Exclude()
export class UserDTO extends BaseDTO {
  public constructor(values: UserDTO) {
    super(values);
  }

  @Expose() public id: string;

  @Expose()
  @Transform(x => (!x ? undefined : trim(x)))
  public username?: string;

  @Expose()
  @Transform(
    x => {
      const date = new Date(x);

      return isNaN(date.getTime()) ? new Date() : date;
    },
    { toClassOnly: true },
  )
  @Transform((x = new Date()) => x.toISOString(), { toPlainOnly: true })
  public createdAt: Date;
}

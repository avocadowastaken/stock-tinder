import { Exclude, Expose, Transform } from "class-transformer";

import { BaseDTO } from "./BaseDTO";

@Exclude()
export class PhotoDTO extends BaseDTO {
  public constructor(values: PhotoDTO) {
    super(values);
  }

  @Expose() public id: string;
  @Expose() public name: string;
  @Expose() public url: string;

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

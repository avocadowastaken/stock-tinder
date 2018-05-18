import { Exclude, Expose } from "class-transformer";
import { BaseDTO } from "./BaseDTO";

@Exclude()
export class PhotoDTO extends BaseDTO {
  public constructor(values: PhotoDTO) {
    super(values);
  }

  @Expose() public id: string;
  @Expose() public name: string;
  @Expose() public url: string;
}

export class BaseDTO {
  protected constructor(values?: Partial<BaseDTO>) {
    if (values) {
      Object.assign(this, values);
    }
  }
}

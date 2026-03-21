declare module "mongoose" {
  interface Model<T = any, TQueryHelpers = any, TMethods = any> {
    aggregatePaginate(aggregate: any, options?: any): Promise<any>;
  }
}

declare module "mongoose-aggregate-paginate-v2";

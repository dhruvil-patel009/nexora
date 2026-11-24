declare module '@nestjs/swagger' {
  export class DocumentBuilder {
    setTitle(title: string): this;
    setDescription(description: string): this;
    setVersion(version: string): this;
    addBearerAuth(options?: any, name?: string): this;
    build(): any;
  }

  export class SwaggerModule {
    static createDocument(app: any, config: any, options?: any): any;
    static setup(path: string, app: any, document: any, options?: any): void;
  }

  export function ApiProperty(options?: any): PropertyDecorator;
  export function ApiTags(...tags: string[]): ClassDecorator;
  export function ApiOperation(options: any): MethodDecorator;
  export function ApiResponse(options: any): MethodDecorator;
  export function ApiBearerAuth(name?: string): MethodDecorator & ClassDecorator;
}

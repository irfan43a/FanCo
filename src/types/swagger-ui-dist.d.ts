declare module "swagger-ui-dist" {
  export interface SwaggerUIOptions {
    url?: string;
    dom_id?: string;
    deepLinking?: boolean;
    displayRequestDuration?: boolean;
    docExpansion?: "list" | "full" | "none";
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    persistAuthorization?: boolean;
    layout?: string;
    presets?: unknown[];
    plugins?: unknown[];
    [key: string]: unknown;
  }

  export function SwaggerUIBundle(options: SwaggerUIOptions): unknown;
  export namespace SwaggerUIBundle {
    export const presets: {
      apis: unknown;
      [key: string]: unknown;
    };
  }

  export function SwaggerUIStandalonePreset(): unknown;
  export function getAbsoluteFSPath(): string;
  export const absolutePath: string;

  const swaggerUi: {
    SwaggerUIBundle: typeof SwaggerUIBundle;
    SwaggerUIStandalonePreset: typeof SwaggerUIStandalonePreset;
    getAbsoluteFSPath: typeof getAbsoluteFSPath;
    absolutePath: string;
  };

  export default swaggerUi;
}

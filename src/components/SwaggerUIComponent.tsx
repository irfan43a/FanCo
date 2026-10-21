"use client";

import React, { useEffect, useState } from "react";
import "swagger-ui-dist/swagger-ui.css";
import { Loader2 } from "lucide-react";

export default function SwaggerUIComponent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initSwagger() {
      try {
        const swaggerDist = await import("swagger-ui-dist");
        const SwaggerUIBundle = swaggerDist.SwaggerUIBundle || swaggerDist.default?.SwaggerUIBundle;
        const SwaggerUIStandalonePreset = swaggerDist.SwaggerUIStandalonePreset || swaggerDist.default?.SwaggerUIStandalonePreset;

        if (!isMounted) return;

        if (SwaggerUIBundle) {
          SwaggerUIBundle({
            url: "/api/openapi.json",
            dom_id: "#swagger-ui-container",
            deepLinking: true,
            displayRequestDuration: true,
            docExpansion: "list",
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
            persistAuthorization: true,
            layout: "BaseLayout",
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset,
            ].filter(Boolean),
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to initialize Swagger UI:", err);
        setLoading(false);
      }
    }

    initSwagger();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-[600px] w-full bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-6">
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#374151]">
          <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
          <span className="text-sm font-semibold">Memuat Swagger UI & Skema API...</span>
        </div>
      )}
      <div id="swagger-ui-container" />
    </div>
  );
}

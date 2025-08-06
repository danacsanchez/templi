# Datos de Prueba para Templi

## 📁 Categorías de Archivo (tabla: categoria_archivo)

```sql
INSERT INTO categoria_archivo (nombre, descripcion, activo) VALUES
('Plantillas Web', 'Plantillas y temas para sitios web', true),
('Documentos Corporativos', 'Contratos, presentaciones y documentos empresariales', true),
('Recursos Gráficos', 'Logos, iconos, banners y elementos gráficos', true),
('Fotografía', 'Fotos stock, retratos y fotografía comercial', true),
('Música y Audio', 'Pistas musicales, efectos de sonido y audio', true),
('Videos', 'Videos promocionales, tutoriales y contenido audiovisual', true),
('Libros y E-books', 'Libros electrónicos, guías y manuales', true),
('Software y Apps', 'Aplicaciones, plugins y herramientas de software', true);
```

## 🔧 Extensiones de Archivo (tabla: extension_archivo)

```sql
INSERT INTO extension_archivo (nombre, descripcion, activo) VALUES
('HTML', 'Archivo de página web HTML', true),
('CSS', 'Hoja de estilos CSS', true),
('JavaScript', 'Archivo de código JavaScript', true),
('PDF', 'Documento PDF', true),
('DOCX', 'Documento de Microsoft Word', true),
('XLSX', 'Hoja de cálculo de Excel', true),
('PPTX', 'Presentación de PowerPoint', true),
('PSD', 'Archivo de Photoshop', true),
('AI', 'Archivo de Adobe Illustrator', true),
('JPG', 'Imagen JPEG', true),
('PNG', 'Imagen PNG', true),
('SVG', 'Imagen vectorial SVG', true),
('MP3', 'Archivo de audio MP3', true),
('WAV', 'Archivo de audio WAV', true),
('MP4', 'Video MP4', true),
('MOV', 'Video QuickTime', true),
('ZIP', 'Archivo comprimido ZIP', true),
('RAR', 'Archivo comprimido RAR', true);
```

## 📝 Datos de Ejemplo para Pruebas

### Ejemplo 1: Plantilla Web
- **Nombre del Producto**: "Plantilla E-commerce Moderna"
- **Descripción**: "Plantilla completa para tienda online con diseño responsive, carrito de compras integrado y panel de administración. Incluye 15 páginas diferentes y está optimizada para SEO."
- **Precio**: 49.99
- **Categoría**: Plantillas Web
- **Extensión**: HTML
- **Archivo**: Puedes usar cualquier archivo .zip o .html
- **Imágenes**: 3-4 imágenes de la plantilla (capturas de pantalla)

### Ejemplo 2: Logo Corporativo
- **Nombre del Producto**: "Pack de Logos Minimalistas"
- **Descripción**: "Colección de 20 logos minimalistas en formato vectorial. Perfectos para startups y empresas modernas. Incluye versiones en color y monocromático."
- **Precio**: 29.50
- **Categoría**: Recursos Gráficos
- **Extensión**: AI
- **Archivo**: Cualquier archivo .ai, .zip o imagen
- **Imágenes**: 2-3 imágenes mostrando diferentes logos

### Ejemplo 3: Documento Corporativo
- **Nombre del Producto**: "Plantilla de Contrato de Servicios"
- **Descripción**: "Plantilla profesional para contrato de servicios con todas las cláusulas legales necesarias. Formato editable y listo para personalizar."
- **Precio**: 15.00
- **Categoría**: Documentos Corporativos
- **Extensión**: DOCX
- **Archivo**: Cualquier archivo .docx o .pdf
- **Imágenes**: 1-2 imágenes del documento

### Ejemplo 4: Fotografía Stock
- **Nombre del Producto**: "Pack Fotos de Oficina Moderna"
- **Descripción**: "Colección de 50 fotografías profesionales de espacios de oficina modernos. Alta resolución, libres de derechos de autor. Ideales para sitios web corporativos."
- **Precio**: 39.99
- **Categoría**: Fotografía
- **Extensión**: JPG
- **Archivo**: Cualquier imagen .jpg
- **Imágenes**: 4-5 imágenes de muestra

### Ejemplo 5: E-book
- **Nombre del Producto**: "Guía Completa de Marketing Digital"
- **Descripción**: "E-book de 120 páginas con estrategias probadas de marketing digital. Incluye casos de estudio reales y plantillas descargables."
- **Precio**: 25.00
- **Categoría**: Libros y E-books
- **Extensión**: PDF
- **Archivo**: Cualquier archivo .pdf
- **Imágenes**: 2-3 imágenes de la portada y páginas interiores

## 🖼️ Tips para las Imágenes de Prueba

### Puedes usar estas fuentes para imágenes de prueba:
1. **Unsplash.com** - Fotos gratuitas de alta calidad
2. **Pexels.com** - Banco de imágenes gratuitas
3. **Pixabay.com** - Imágenes, vectores e ilustraciones

### Tamaños recomendados:
- **Portada**: 800x600px o 1200x800px
- **Imágenes adicionales**: 600x400px mínimo
- **Formato**: JPG o PNG

## 🎯 Flujo de Prueba Recomendado

1. **Crear categorías y extensiones** (ejecutar los SQL de arriba)
2. **Probar formulario básico** con el Ejemplo 1
3. **Probar subida de imágenes** con 2-3 imágenes
4. **Probar establecer portada** diferente a la primera imagen
5. **Probar cambiar orden** de las imágenes
6. **Probar validaciones** dejando campos vacíos
7. **Probar edición** de un archivo existente

## 🔍 Verificaciones en Base de Datos

Después de cada prueba, verifica:
```sql
-- Ver archivos creados
SELECT * FROM archivos ORDER BY fecha_creacion DESC;

-- Ver imágenes asociadas
SELECT ia.*, a.nombre_archivo 
FROM imagenes_archivo ia 
JOIN archivos a ON ia.id_archivo = a.id_archivo 
ORDER BY ia.id_archivo, ia.orden;

-- Ver cuál es la portada
SELECT ia.*, a.nombre_archivo 
FROM imagenes_archivo ia 
JOIN archivos a ON ia.id_archivo = a.id_archivo 
WHERE ia.es_portada = true;
```

## 🚨 Posibles Errores a Revisar

1. **Error 401**: Token de autenticación inválido
2. **Error 400**: Datos faltantes o formato incorrecto
3. **Error 500**: Error en el servidor (verificar logs del backend)
4. **CORS**: Si hay problemas de origen cruzado

¡Con estos datos podrás hacer pruebas completas del sistema! 🚀

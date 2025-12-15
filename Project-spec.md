# OpenMovies API – Specification

## 1. Descripción general
OpenMovies API es una **API REST pública** para consultar, buscar y gestionar información de películas, actores y directores.  
El sistema permite acceso público de solo lectura, mientras que los usuarios autenticados (vía JWT) pueden crear, editar y eliminar registros.  
Integra datos externos desde **TMDb** para autocompletar información de películas y se implementa con caching, testing y despliegue real.

---

## 2. Tecnologías principales
- **Backend:** Django REST Framework  
- **Base de datos:** PostgreSQL  
- **Autenticación:** JWT (SimpleJWT)  
- **Cache:** Redis (para resultados frecuentes)  
- **Testing:** pytest  
- **Despliegue:** Docker + Render / Railway  
- **Documentación:** Swagger / ReDoc  

---

## 3. Modelos

### Movie
| Campo | Tipo | Descripción |
|-------|------|--------------|
| id | UUID / AutoField | Identificador único |
| title | CharField | Título de la película |
| year | IntegerField | Año de estreno |
| genre | CharField | Género principal |
| rating | FloatField | Calificación promedio |
| description | TextField | Sinopsis o descripción |
| poster_url | URLField | Enlace al póster |
| created_at / updated_at | DateTimeField | Fechas de auditoría |
| director | ForeignKey → Director | Director de la película |
| actors | ManyToMany → Actor | Actores principales |

### Director
| Campo | Tipo | Descripción |
|-------|------|--------------|
| id | UUID / AutoField | Identificador único |
| name | CharField | Nombre completo |
| nationality | CharField | Nacionalidad |

### Actor
| Campo | Tipo | Descripción |
|-------|------|--------------|
| id | UUID / AutoField | Identificador único |
| name | CharField | Nombre completo |
| nationality | CharField | Nacionalidad |

---

## 4. Endpoints

### Públicos
| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| `GET` | `/movies/` | Lista de películas con filtros por título, género, año o rating |
| `GET` | `/movies/{id}/` | Detalle de una película |
| `GET` | `/actors/` | Lista de actores |
| `GET` | `/actors/{id}/` | Detalle de un actor |
| `GET` | `/directors/` | Lista de directores |
| `GET` | `/directors/{id}/` | Detalle de un director |

### Privados (requieren JWT)
| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| `POST` | `/movies/` | Crear una nueva película (puede autocompletar desde API externa) |
| `PUT` | `/movies/{id}/` | Editar película existente |
| `DELETE` | `/movies/{id}/` | Eliminar película |
| `POST/PUT/DELETE` | `/actors/`, `/directors/` | CRUD completo para actores y directores |

---

## 5. Integración externa
Al crear o actualizar una película, si solo se envía el campo `title`, la API realiza una consulta a **TMDb** para obtener automáticamente:
- `year`
- `genre`
- `description`
- `poster_url`
- `rating`

Estos datos se almacenan junto a la información local.

---

## 6. Funcionalidades extra
- Cache en Redis para las consultas más frecuentes.  
- Logging de requests y errores.  
- Tests unitarios y de integración con `pytest`.  
- Despliegue con **Docker** y base de datos PostgreSQL.  
- Documentación visible en `/docs` o `/swagger`.  

---

## 7. Entregables
1. Código limpio, modular y documentado.  
2. **README** con:
   - Pasos de instalación.
   - Variables de entorno requeridas.
   - Instrucciones de ejecución y despliegue.
   - Descripción de endpoints principales.
3. **Fixtures iniciales** para carga de datos base.  
4. **Demo pública funcional** desplegada en Render o Railway.  

---

## 8. Objetivo del proyecto
Dominar el ciclo completo de desarrollo backend profesional:
- Diseño de modelos relacionales y optimización de queries.  
- Implementación de APIs RESTful con autenticación y permisos.  
- Integración con servicios externos y caching.  
- Testing, logging y CI/CD.  
- Despliegue productivo con Docker y documentación técnica.  

Este proyecto consolida el stack Django REST Framework + PostgreSQL + Redis.
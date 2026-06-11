# TerraFlow Architecture & Route Mappings

This document connects frontend UI actions and components with their respective REST API routes, NestJS controllers, and backend services.

## Flow Mapping Table

| Flow | UI Component / Page | REST API Route | Backend Controller | Backend Service |
| :--- | :--- | :--- | :--- | :--- |
| **Upload** | `apps/web/src/components/PostModal.tsx`<br>`apps/web/src/app/page.tsx` | `POST /api/v1/posts/upload`<br>`POST /api/v1/posts` | `PostsController`<br>(`apps/api/src/posts/posts.controller.ts`) | `StorageService`<br>(`apps/api/src/posts/storage.service.ts`)<br>`PostsService`<br>(`apps/api/src/posts/posts.service.ts`) |
| **Search** | `apps/web/src/app/page.tsx` | `GET /api/v1/posts/search`<br>_External Nominatim API_ | `PostsController`<br>(`apps/api/src/posts/posts.controller.ts`) | `PostsService`<br>(`apps/api/src/posts/posts.service.ts`) |
| **Profile** | `apps/web/src/components/ProfilePanel.tsx`<br>`apps/web/src/components/PublicProfile.tsx`<br>`apps/web/src/app/u/[username]/page.tsx` | `GET /api/v1/auth/users/:username`<br>`PATCH /api/v1/auth/profile`<br>`POST /api/v1/posts/upload` | `AuthController`<br>(`apps/api/src/auth/auth.controller.ts`) | `AuthService`<br>(`apps/api/src/auth/auth.service.ts`) |
| **Authentication** | `apps/web/src/app/page.tsx` | `POST /api/v1/auth/register`<br>`POST /api/v1/auth/login`<br>`GET /api/v1/auth/google`<br>`GET /api/v1/auth/google/callback`<br>`POST /api/v1/auth/logout`<br>`GET /api/v1/auth/me` | `AuthController`<br>(`apps/api/src/auth/auth.controller.ts`) | `AuthService`<br>(`apps/api/src/auth/auth.service.ts`) |
| **Explore** | `apps/web/src/app/page.tsx`<br>`apps/web/src/components/globe/CesiumGlobe.tsx` | `GET /api/v1/posts/explore` | `PostsController`<br>(`apps/api/src/posts/posts.controller.ts`) | `PostsService`<br>(`apps/api/src/posts/posts.service.ts`) |

---

## Flow Breakdown & Explanations

### 1. Upload Flow
- **Overview**: Handles capturing a user memory (media + title + description + visibility + coordinates) and publishing it onto the 3D globe.
- **Frontend Process**: Selecting the Upload option from navigation triggers `PostModal` (via the main layout in `page.tsx`). On file selection, file constraints are checked (MIME type limits, and maximum file size of 10MB for images and 50MB for video). It is uploaded as `FormData` using `POST /api/v1/posts/upload`. When user hits "Publish memory", a `POST /api/v1/posts` containing JSON payload coordinates, title, description, and visibility is fired.
- **Backend Process**:
  - `PostsController.uploadMedia` handles multipart file upload, calling `StorageService.uploadFile` to upload the raw stream, and `StorageService.extractExifGPS` to attempt GPS coordinate extraction from raw images.
  - `PostsController.create` receives the post schema. `PostsService.createPost` creates the post via Prisma. It maps lat/lng into an H3 spatial index (`latLngToCell`) at resolution 8 to facilitate future hex density calculations. Finally, `PostsService` triggers an asynchronous reverse-geocoding process (`asyncUpdateTravelStats`) using the OpenStreetMap Nominatim reverse API to query city/country records and unlock achievements.

### 2. Search Flow
- **Overview**: Resolves text inputs into physical positions on Earth and queries relevant memory posts.
- **Frontend Process**: Changing the search text in the search pane of `page.tsx` starts a debounced (360ms) function.
- **Backend Process**:
  - The frontend queries OpenStreetMap's Nominatim search endpoint (`https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=5`) to geocode place names, allowing user travel redirects on the globe.
  - The frontend concurrently calls `/api/v1/posts/search?q={query}`. `PostsController.search` accepts the string and delegates to `PostsService.searchPosts`, executing case-insensitive database matching via Prisma against the title and description fields, filtered to respect visibility permissions.

### 3. Profile Flow
- **Overview**: Displays traveler stats (countries, cities, distance, badges) and lists their memories, permitting detail updates.
- **Frontend Process**: 
  - Navigating to `/u/[username]` or opening the main `ProfilePanel` requests public data.
  - Clicking "Edit Profile" edits name and bio. Replacing an avatar picture triggers `POST /api/v1/posts/upload`, storing the media and updating the profile details with `PATCH /api/v1/auth/profile`.
- **Backend Process**:
  - `AuthController.getPublicProfile` retrieves the user record by username, aggregating public memories and travel statistics.
  - `AuthController.updateProfile` patches user records in PostgreSQL.

### 4. Authentication Flow
- **Overview**: Handles local registration/login and social Google Sign-In.
- **Frontend Process**: Handled inside `page.tsx`. Active tokens (`tf_token`) are verified on launch. Clicking options triggers credential checks or Google OAuth redirects.
- **Backend Process**:
  - Local authentication maps username and password credentials using `/api/v1/auth/register` and `/api/v1/auth/login`. On login, `setAuthCookies` assigns `accessToken` and `refreshToken` headers.
  - Google OAuth initiates at `GET /api/v1/auth/google`. Callback landing at `GET /api/v1/auth/google/callback` attaches cookies and redirects user to frontend with tokens.
  - In-memory validation uses `/api/v1/auth/me` to retrieve current profile parameters, while logout clears cookie state.

### 5. Explore Flow
- **Overview**: Provides map coordinates query mechanisms utilizing client globe bounding boxes and zooms to yield posts or spatial H3 hexagons clusters.
- **Frontend Process**: Changing view bounds or zooming the Cesium globe triggers a fetch call to `/api/v1/posts/explore?minLat={minLat}&maxLat={maxLat}&minLng={minLng}&maxLng={maxLng}&zoom={zoomLevel}`.
- **Backend Process**:
  - `PostsController.explore` extracts query coordinates bounds.
  - `PostsService.explore` applies visibility checks (public memories, personal posts, or posts shared by followed friends).
  - If the map zoom level is $\le 9$, results are clustered server-side utilizing H3 hexagon cells (`cellToParent`/`h3ToParent`) depending on resolution factors. A list of densities (with counts and sample posts) is returned.
  - If the zoom level is $> 9$, individual post metadata are returned directly. The client paints these coordinates on the 3D globe using visual custom pins.

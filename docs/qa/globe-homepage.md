# Globe Homepage QA Checklist

This document details the expected user-visible behaviors for the TerraFlow globe homepage (`/`) and guides manual verification across viewports, controls, and active features.

---

## Expected Local URLs

Verify local monorepo builds using the following ports:
- **Web Frontend Application**: `http://localhost:3000`
- **Backend API Gateway**: `http://localhost:4000`
- **Backend REST Prefix**: `http://localhost:4000/api/v1`
- **Local Upload Assets**: `http://localhost:4000/uploads/:filename`

---

## QA Checklists

### 1. Viewport Layouts

#### Desktop Viewport (`1440 × 900`)
- [ ] **Full-Screen View**: The page fits within a single viewport. No page-level document scrollbars should appear.
- [ ] **Globe Rendering**: The Cesium 3D globe fills the screen and renders without canvas display errors.
- [ ] **Overlays Layout**: Floating navigation elements (`tf-nav`), top auth actions (`tf-top-actions`), and side panels fit comfortably and do not overlap.
- [ ] **Pill/Button Interactions**: Controls show visual hover and active states (transitions, cursor pointer).

#### Mobile Viewport (`390 × 844`)
- [ ] **Responsive Navigation**: Nav items adapt to the mobile bottom navigation bar (`tf-mobile-nav`) at the screen bottom.
- [ ] **Modal Overlay Sheets**: Profile, notifications, and memory details slide up as full sheets matching the mobile device width.
- [ ] **Header Scaling**: Header elements like the logo shrink or layout correctly to avoid overlapping with top action pills.

### 2. Search Functionality

- [ ] **Split Search Results**: Querying a term shows two distinct categories in the suggestion dropdown:
  - **Locations**: Pinned landmarks from OpenStreetMap Nominatim.
  - **Memories**: Match matching titles and descriptions from the TerraFlow API database.
- [ ] **Camera Navigation on Selection**:
  - Selecting a *Location* pans and flies the camera to the coordinate bounds.
  - Selecting a *Memory* highlights the memory, opens the `MemoryCard` view, and flies the camera close to the memory pin.
- [ ] **Loading Feedback**: Loading skeletons (rounded bars) appear during the debounce period.
- [ ] **Search Empty State**: Returning zero results displays a card reading: `"The globe is silent here. Try another place or memory."`
- [ ] **Reset & Close**: Clicking "Close" cancels the search state, clears the input, and returns focus.

### 3. Upload & Login Gate

- [ ] **Guest Mode Features**: Guest exploration is fully unlocked. Unauthenticated visitors can zoom, rotate, search, and click featured pins.
- [ ] **Auto-Spin**: The planet slowly revolves automatically around its polar axis for guest visitors.
- [ ] **Authentication Gate**: Clicking "Upload", "Alerts" (Notifications), or "Profile" triggers the "Join TerraFlow" Authentication Modal.
- [ ] **Non-Intrusive Dismissal**: Guests can click the "X" close button on the login card to return to globe exploration immediately without browser refreshes.
- [ ] **Geolocated Upload Triggers**: Authenticated users can click a coordinate position on the globe to display a coordinates toast and open the geolocated `PostModal`.

### 4. Memory Cards

- [ ] **Media Preview & Fallbacks**: The card displays the attached image or video. If no media is attached, it displays `"No photo attached"`.
- [ ] **Reverse Geocoding Place Name**: The top location chip resolves to a human-readable city/landmark name fetched from Nominatim.
- [ ] **Completion Progress Indicators**: The upload form shows progress checkpoints corresponding to fields filled (Photo, Location, Title, Visibility, Submitting).
- [ ] **Visibility Controls**: Shows visible segment selections (`public`, `friends`, `private`).
- [ ] **Social Interactions**: Authenticated users can toggle the "Like" button to increment counts on non-demo posts.
- [ ] **Ownership Privileges**: Memory owners see a delete trash icon; clicking it prompts confirmation and deletes the pin.

### 5. Globe Controls

- [ ] **Globe Camera Orbit**: Dragging on the globe pans the planet; right-clicking and dragging changes camera tilt/pitch.
- [ ] **Global Reset Control**: Clicking the `LocateFixed` icon button ("Return to global view") flies the camera smoothly to default overview coordinates (Latitude `20`, Longitude `10`, height `10,500,000` meters).
- [ ] **Pin Interactions**: Clicking a pin flies the camera close to that memory and highlights it.

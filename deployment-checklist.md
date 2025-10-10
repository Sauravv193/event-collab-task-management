# Deployment Checklist

## ✅ Pre-deployment (Completed)
- [x] Fixed Java version mismatch (Java 21)
- [x] Updated Vercel config for Vite
- [x] Fixed Maven wrapper permissions
- [x] Updated render.yaml configuration
- [x] Committed and pushed changes

## 📋 Render Backend Deployment

### Environment Variables Required:
```
JWT_EXPIRATION_MS=86400000
JWT_SECRET=zSL9peW3xqT*qE7y'Ui0A2s04f60hJ8kLBwNPDV_c-XzS+dF9Hgwrrdue6G3wvh/pooreh35gfefrdodctr74gtakq0cg6g2X4SfgIehcb
PORT=8080
SPRING_DATASOURCE_PASSWORD=npg_vYavWO5gQCGM
SPRING_DATASOURCE_URL=jdbc:postgresql://ep-solitary-heart-adozubwq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-solitary-heart-adozubwq-pooler
SPRING_DATASOURCE_USERNAME=neondb_owner
SPRING_PROFILES_ACTIVE=prod
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
```

### Deployment Status:
- [ ] Backend service created on Render
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] Health check passing at `/actuator/health`

## 🌐 Vercel Frontend Deployment

### Environment Variables Required:
```
VITE_API_BASE_URL=https://event-collab-backend.onrender.com/api/v1
VITE_WS_URL=https://event-collab-backend.onrender.com/ws
```

### Deployment Status:
- [ ] Repository connected to Vercel
- [ ] Root directory set to `./`
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] Frontend accessible

## 🔄 Post-Deployment Updates
- [ ] Update CORS_ALLOWED_ORIGINS with actual Vercel URL
- [ ] Test API connectivity
- [ ] Test WebSocket connection
- [ ] Verify authentication flow

## 📱 URLs to Track
- Backend Health: https://event-collab-backend.onrender.com/actuator/health
- Backend API Docs: https://event-collab-backend.onrender.com/swagger-ui/index.html
- Frontend: https://your-app-name.vercel.app

## 🐛 Common Issues & Solutions

### Backend Issues:
- **Build fails**: Check Java 21 is available on Render
- **Database connection fails**: Verify Neon DB credentials
- **Port binding fails**: Ensure PORT environment variable is set

### Frontend Issues:
- **API calls fail**: Check VITE_API_BASE_URL is correct
- **CORS errors**: Update CORS_ALLOWED_ORIGINS on backend
- **Build fails**: Ensure all dependencies are in package.json

### General:
- **502 errors**: Backend is starting up (can take 2-3 minutes)
- **403/401 errors**: Check JWT configuration and tokens
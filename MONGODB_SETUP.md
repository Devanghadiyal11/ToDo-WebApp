# MongoDB Setup Instructions

## Option 1: Local MongoDB Installation (Recommended for Development)

### Windows:

1. **Download MongoDB Community Server**:
   - Go to: https://www.mongodb.com/try/download/community
   - Select "Windows" as OS
   - Download MSI installer

2. **Install MongoDB**:
   - Run the downloaded MSI file
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service
   - Install MongoDB Compass (optional GUI)

3. **Start MongoDB Service**:
   ```powershell
   # MongoDB service should start automatically
   # To check if it's running:
   Get-Service -Name "MongoDB"
   
   # If not running, start it:
   Start-Service -Name "MongoDB"
   ```

4. **Verify Installation**:
   ```powershell
   # Connect to MongoDB
   mongosh
   
   # You should see MongoDB shell prompt
   ```

### Alternative: Using Chocolatey (if you have it installed):
```powershell
choco install mongodb
```

## Option 2: MongoDB Atlas (Cloud - No Installation Required)

1. **Create Account**:
   - Go to: https://www.mongodb.com/atlas
   - Sign up for free account

2. **Create Cluster**:
   - Create new cluster (free tier available)
   - Choose region closest to you

3. **Setup Database Access**:
   - Go to Database Access
   - Add new database user
   - Create username and password

4. **Setup Network Access**:
   - Go to Network Access
   - Add IP address (0.0.0.0/0 for all IPs - for development only)

5. **Get Connection String**:
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string

6. **Update .env.local**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ToDoList?retryWrites=true&w=majority
   ```

## Option 3: Docker (if you have Docker installed)

```bash
# Run MongoDB in Docker container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# To stop and remove
docker stop mongodb
docker rm mongodb
```

## Troubleshooting

### MongoDB Service Not Starting:
```powershell
# Check service status
Get-Service -Name "MongoDB"

# Start service manually
Start-Service -Name "MongoDB"

# Check logs
Get-EventLog -LogName Application -Source "MongoDB" -Newest 10
```

### Connection Issues:
1. Ensure MongoDB is running on port 27017
2. Check Windows Firewall settings
3. Verify connection string in .env.local

### Reset Database:
```javascript
// Connect to MongoDB shell
mongosh

// Switch to your database
use ToDoList

// Drop all collections (careful!)
db.users.drop()
db.tasks.drop()
db.categories.drop()
```

## After Setup

1. Restart your Next.js development server:
   ```bash
   npm run dev
   ```

2. Try registering a new user account
3. Login with the created credentials

Your todo app should now work properly!

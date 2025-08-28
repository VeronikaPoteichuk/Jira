# PowerShell script для запуска фронтенда с hot-reload
Write-Host "Starting Frontend with Hot-Reload..." -ForegroundColor Green
Write-Host ""

try {
    docker version | Out-Null
} catch {
    Write-Host "Docker не запущен! Запустите Docker Desktop и попробуйте снова." -ForegroundColor Red
    exit 1
}

Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose stop frontend

Write-Host "Removing existing frontend container..." -ForegroundColor Yellow
docker-compose rm -f frontend

Write-Host "Rebuilding frontend image..." -ForegroundColor Yellow
docker-compose build frontend

Write-Host "Starting frontend with hot-reload..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

docker-compose up frontend

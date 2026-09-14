$ErrorActionPreference = "Stop"

$project = $PSScriptRoot
Set-Location $project

Write-Host "Starting Online Leave System..."

# รอ Docker ให้พร้อม
while ($true) {
    try {
        docker info *> $null
        break
    }
    catch {
        Write-Host "Waiting for Docker Desktop..."
        Start-Sleep -Seconds 5
    }
}

# เปิดระบบด้วยค่า localhost ก่อน
docker compose up -d

$frontendPort = $env:FRONTEND_PORT
if (-not $frontendPort) {
    $frontendPort = "18080"
}

# ลบ Quick Tunnel container เก่า ถ้ามีจริง
$oldTunnel = docker ps -a --filter "name=^online-leave-system-tunnel$" --format "{{.Names}}"

if ($oldTunnel -eq "online-leave-system-tunnel") {
    docker rm -f online-leave-system-tunnel | Out-Null
}

# เปิด Quick Tunnel แบบ background
docker run -d `
  --name online-leave-system-tunnel `
  cloudflare/cloudflared:latest `
  tunnel --no-autoupdate `
  --url "http://host.docker.internal:$frontendPort" | Out-Null

Write-Host "Waiting for Cloudflare Tunnel..."

$tunnelUrl = $null

for ($i = 0; $i -lt 60; $i++) {

  $logs = cmd /c "docker logs online-leave-system-tunnel 2>&1" | Out-String

    $match = [regex]::Match(
        $logs,
        'https://[a-zA-Z0-9-]+\.trycloudflare\.com'
    )

    if ($match.Success) {
        $tunnelUrl = $match.Value
        break
    }

    Start-Sleep -Seconds 2
}

if (-not $tunnelUrl) {
    Write-Host "ERROR: Could not get Cloudflare Tunnel URL."
    exit 1
}

$tunnelHost = ([uri]$tunnelUrl).Host

Write-Host ""
Write-Host "Tunnel URL: $tunnelUrl"
Write-Host ""

# ส่ง URL เข้า Docker Compose
$env:TUNNEL_URL = $tunnelUrl
$env:TUNNEL_HOST = $tunnelHost

# Recreate frontend/backend ด้วยค่า Tunnel ใหม่
docker compose up -d --force-recreate frontend backend

# รอจน Frontend proxy เชื่อมต่อ Backend ได้จริงก่อนแจ้งว่าระบบพร้อม
# ป้องกันผู้ใช้เปิดหน้าเว็บระหว่าง Backend กำลัง migrate/restart แล้วพบ 502
Write-Host "Waiting for application services..."
$applicationReady = $false

for ($i = 0; $i -lt 60; $i++) {
    try {
        $healthResponse = Invoke-WebRequest `
            -Uri "http://127.0.0.1:$frontendPort/api/health" `
            -UseBasicParsing `
            -TimeoutSec 5

        if ($healthResponse.StatusCode -eq 200) {
            $applicationReady = $true
            break
        }
    }
    catch {
        # บริการยังเริ่มทำงานไม่เสร็จ ให้ลองใหม่
    }

    Start-Sleep -Seconds 2
}

if (-not $applicationReady) {
    Write-Host "ERROR: Frontend or Backend did not become ready in time."
    docker compose ps
    exit 1
}

# บันทึกลิงก์ล่าสุดไว้
$tunnelUrl | Set-Content ".\CURRENT_TUNNEL_URL.txt"

Write-Host ""
Write-Host "========================================="
Write-Host " ONLINE LEAVE SYSTEM READY"
Write-Host "========================================="
Write-Host ""
Write-Host "Public URL:"
Write-Host $tunnelUrl
Write-Host ""
Write-Host "URL saved to CURRENT_TUNNEL_URL.txt"
Write-Host ""

$apiDir = "C:\Users\Administrator\Desktop\Bilibili模拟\server"
$frontendDir = "C:\Users\Administrator\Desktop\Bilibili模拟"
$nodeBin = "C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2\node.exe"

# Kill existing node processes on our ports
$ports = @(3001, 5173, 5174)
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn -and $conn.OwningProcess -gt 0) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

# Start API server
$apiJob = [System.Diagnostics.Process]::new()
$apiJob.StartInfo.FileName = $nodeBin
$apiJob.StartInfo.Arguments = "index.js"
$apiJob.StartInfo.WorkingDirectory = $apiDir
$apiJob.StartInfo.UseShellExecute = $false
$apiJob.StartInfo.RedirectStandardOutput = $true
$apiJob.StartInfo.RedirectStandardError = $true
$apiJob.Start() | Out-Null

Start-Sleep -Seconds 4

# Start Vite 5173
$vite1Job = [System.Diagnostics.Process]::new()
$vite1Job.StartInfo.FileName = $nodeBin
$vite1Job.StartInfo.Arguments = "node_modules\.bin\vite --port 5173 --host"
$vite1Job.StartInfo.WorkingDirectory = $frontendDir
$vite1Job.StartInfo.UseShellExecute = $false
$vite1Job.Start() | Out-Null

Start-Sleep -Seconds 2

# Start Vite 5174
$vite2Job = [System.Diagnostics.Process]::new()
$vite2Job.StartInfo.FileName = $nodeBin
$vite2Job.StartInfo.Arguments = "node_modules\.bin\vite --port 5174 --host"
$vite2Job.StartInfo.WorkingDirectory = $frontendDir
$vite2Job.StartInfo.UseShellExecute = $false
$vite2Job.Start() | Out-Null

Start-Sleep -Seconds 8

# Verify
$api = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -ErrorAction SilentlyContinue
$fe1 = Invoke-WebRequest -Uri "http://localhost:5173/" -UseBasicParsing -ErrorAction SilentlyContinue
$fe2 = Invoke-WebRequest -Uri "http://localhost:5174/" -UseBasicParsing -ErrorAction SilentlyContinue
Write-Host "API (3001): $($api.StatusCode)"
Write-Host "Frontend (5173): $($fe1.StatusCode)"
Write-Host "Admin (5174): $($fe2.StatusCode)"

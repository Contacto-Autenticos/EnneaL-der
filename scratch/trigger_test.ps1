$headers = @{
    'Content-Type' = 'application/json'
}

$body = Get-Content -Raw "c:\Users\USUARIO\Desktop\App Test Eneagrama\scratch\test_email.json"

try {
    $response = Invoke-RestMethod -Uri "https://hwrlijzctnzbrkmurvjf.supabase.co/functions/v1/send-workshop-email" -Method Post -Headers $headers -Body $body
    Write-Output "Success: $($response | ConvertTo-Json)"
} catch {
    Write-Error "Failed: $_"
}

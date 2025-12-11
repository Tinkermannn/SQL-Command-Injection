<?php

$output = '';
$command_executed = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tool = $_POST['tool'] ?? '';
    $target = $_POST['target'] ?? '';
    
    if (!empty($tool) && !empty($target)) {

        $safe_target = escapeshellarg($target);
        
        if ($tool === 'ping') {
            $command = "ping -c 4 {$safe_target}";
            $command_executed = $command;
            $output = shell_exec($command);
        }
        elseif ($tool === 'nslookup') {
            $command = "nslookup {$safe_target}";
            $command_executed = $command;
            $output = shell_exec($command);
        }
        elseif ($tool === 'traceroute') {
            $command = "traceroute -m 15 {$safe_target}";
            $command_executed = $command;
            $output = shell_exec($command);
        }
        elseif ($tool === 'whois') {
            $command = "whois {$safe_target}";
            $command_executed = $command;
            $output = shell_exec($command);
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Network Diagnostics Tool</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            padding: 40px;
            border: 1px solid #e1e5e9;
        }
        
        .header {
            border-bottom: 2px solid #2c5aa0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        h1 {
            color: #2c5aa0;
            margin-bottom: 8px;
            font-size: 28px;
            font-weight: 600;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
            font-size: 14px;
        }
        
        select, input[type="text"] {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 15px;
            font-family: 'Segoe UI', Arial, sans-serif;
            transition: border-color 0.3s ease;
        }
        
        select:focus, input[type="text"]:focus {
            outline: none;
            border-color: #2c5aa0;
            box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
        }
        
        button {
            background: #2c5aa0;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            transition: background-color 0.3s ease;
        }
        
        button:hover {
            background: #1e3d6f;
        }
        
        .command-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-left: 4px solid #f39c12;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-size: 13px;
            color: #856404;
            font-family: 'Courier New', monospace;
            word-break: break-all;
        }
        
        .output-container {
            margin-top: 35px;
            padding: 25px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        
        .output-container h2 {
            color: #2c5aa0;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: 600;
        }
        
        .output {
            background: white;
            padding: 20px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 13px;
            max-height: 500px;
            overflow-y: auto;
            white-space: pre-wrap;
            color: #2d3748;
            border: 1px solid #e2e8f0;
            line-height: 1.5;
        }
        
        .tool-description {
            color: #666;
            font-size: 13px;
            margin-top: 5px;
            font-style: italic;
        }
        
        .form-row {
            display: flex;
            gap: 20px;
        }
        
        .form-row .form-group {
            flex: 1;
        }
        
        @media (max-width: 768px) {
            .form-row {
                flex-direction: column;
                gap: 0;
            }
            
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Network Diagnostics Tool</h1>
        </div>
        
        <form method="POST">
            <div class="form-row">
                <div class="form-group">
                    <label for="tool">Diagnostic Tool</label>
                    <select name="tool" id="tool" required>
                        <option value="">-- Select Diagnostic Tool --</option>
                        <option value="ping">Ping Connectivity Test</option>
                        <option value="nslookup">DNS Resolution (nslookup)</option>
                        <option value="traceroute">Path Analysis (traceroute)</option>
                        <option value="whois">Domain Information (WHOIS)</option>
                    </select>
                    <div class="tool-description">Select the network diagnostic tool to execute</div>
                </div>
                
                <div class="form-group">
                    <label for="target">Target Host</label>
                    <input type="text" name="target" id="target" placeholder="Enter hostname (example.com) or IP address (192.168.1.1)" required>
                    <div class="tool-description">Specify the target hostname or IP address for analysis</div>
                </div>
            </div>
            
            <button type="submit">Execute Diagnostic</button>
        </form>
        
        
        <?php if (!empty($command_executed)): ?>
            <div class="command-box">
                <strong>Command Executed:</strong><br>
                <?php echo htmlspecialchars($command_executed); ?>
            </div>
        <?php endif; ?>
        
        <?php if (!empty($output)): ?>
            <div class="output-container">
                <h2>Diagnostic Results</h2>
                <div class="output"><?php echo htmlspecialchars($output); ?></div>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
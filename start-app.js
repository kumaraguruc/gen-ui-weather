import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import process from 'process';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Function to log with timestamp and color
function log(message, color = colors.reset) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

// Check if Python is installed and get the correct command
async function getPythonCommand() {
  // Try python3 first (common on macOS and Linux)
  try {
    const python3Process = spawn('python3', ['--version']);
    const result = await new Promise((resolve) => {
      python3Process.on('close', (code) => {
        resolve(code === 0 ? 'python3' : null);
      });
    });
    if (result) return result;
  } catch {
    // Ignore error and try next command
  }
  
  // Try python (common on Windows and some Linux/macOS installations)
  try {
    const pythonProcess = spawn('python', ['--version']);
    const result = await new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        resolve(code === 0 ? 'python' : null);
      });
    });
    if (result) return result;
  } catch {
    // Ignore error and try next command
  }
  
  // If we get here, neither command worked
  return null;
}

// Check if required Python packages are installed
function checkPythonPackages(pythonCommand) {
  const checkPackagesScript = `
import importlib.util
import sys

required_packages = ['flask', 'flask_cors', 'python-dotenv']
missing_packages = []

for package in required_packages:
    spec = importlib.util.find_spec(package)
    if spec is None:
        missing_packages.append(package)

if missing_packages:
    print(','.join(missing_packages))
    sys.exit(1)
else:
    sys.exit(0)
  `;

  const tempScriptPath = path.join(__dirname, 'check_packages.py');
  fs.writeFileSync(tempScriptPath, checkPackagesScript);

  return new Promise((resolve) => {
    const pythonProcess = spawn(pythonCommand, [tempScriptPath]);
    let output = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.on('close', (code) => {
      fs.unlinkSync(tempScriptPath);
      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({ success: false, missingPackages: output.trim().split(',') });
      }
    });
  });
}

// Install missing Python packages
function installPythonPackages(packages, pythonCommand) {
  log(`Installing missing Python packages: ${packages.join(', ')}...`, colors.yellow);
  
  // Determine pip command based on python command
  const pipCommand = pythonCommand === 'python3' ? 'pip3' : 'pip';
  
  return new Promise((resolve, reject) => {
    const pipProcess = spawn(pipCommand, ['install', ...packages]);
    
    pipProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    pipProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    pipProcess.on('close', (code) => {
      if (code === 0) {
        log('Packages installed successfully!', colors.green);
        resolve();
      } else {
        reject(new Error(`Failed to install packages. Exit code: ${code}`));
      }
    });
  });
}

// Start Flask backend
function startFlaskBackend(pythonCommand) {
  log('Starting Flask backend...', colors.blue);
  
  const flaskProcess = spawn(pythonCommand, ['app.py']);
  
  flaskProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`${colors.blue}[Flask]${colors.reset} ${output}`);
  });
  
  flaskProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    console.error(`${colors.red}[Flask Error]${colors.reset} ${output}`);
  });
  
  flaskProcess.on('close', (code) => {
    if (code !== 0) {
      log(`Flask backend exited with code ${code}`, colors.red);
    }
  });
  
  return flaskProcess;
}

// Find npm executable path
async function findNpmPath() {
  // Try using 'which' command on Unix-like systems
  if (process.platform !== 'win32') {
    try {
      const whichProcess = spawn('which', ['npm']);
      let output = '';
      
      whichProcess.stdout.on('data', (data) => {
        output += data.toString().trim();
      });
      
      const result = await new Promise((resolve) => {
        whichProcess.on('close', (code) => {
          resolve(code === 0 ? output : null);
        });
      });
      
      if (result) return result;
    } catch {
      // Ignore error and try next method
    }
  }
  
  // Try common npm locations
  const npmLocations = [
    // Windows
    'C:\\Program Files\\nodejs\\npm.cmd',
    'C:\\Program Files (x86)\\nodejs\\npm.cmd',
    // Unix-like
    '/usr/local/bin/npm',
    '/usr/bin/npm',
    '/opt/homebrew/bin/npm',
    // Add npm from NVM locations
    `${process.env.HOME}/.nvm/versions/node/*/bin/npm`,
  ];
  
  for (const location of npmLocations) {
    try {
      if (fs.existsSync(location)) {
        return location;
      }
    } catch {
      // Ignore error and try next location
    }
  }
  
  // Default to just 'npm' and hope it's in PATH
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

// Start React application
async function startReactApp() {
  log('Starting React application...', colors.green);
  
  // Find npm path
  const npmPath = await findNpmPath();
  log(`Using npm from: ${npmPath}`, colors.dim);
  
  // Use the current directory for running npm
  const reactProcess = spawn(npmPath, ['run', 'dev'], {
    cwd: __dirname,
    shell: true  // Use shell to help find npm in PATH
  });
  
  reactProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`${colors.green}[React]${colors.reset} ${output}`);
  });
  
  reactProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    console.error(`${colors.red}[React Error]${colors.reset} ${output}`);
  });
  
  reactProcess.on('close', (code) => {
    if (code !== 0) {
      log(`React application exited with code ${code}`, colors.red);
    }
  });
  
  return reactProcess;
}

// Main function
async function main() {
  log('Starting the application...', colors.bright);
  
  // Check if Python is installed and get the correct command
  const pythonCommand = await getPythonCommand();
  if (!pythonCommand) {
    log('Python is not installed or not in PATH. Please install Python and try again.', colors.red);
    log('You may need to install Python from https://www.python.org/downloads/', colors.yellow);
    process.exit(1);
  }
  
  log(`Found Python command: ${pythonCommand}`, colors.green);
  
  // Check if required Python packages are installed
  const packagesCheck = await checkPythonPackages(pythonCommand);
  if (!packagesCheck.success) {
    try {
      await installPythonPackages(packagesCheck.missingPackages, pythonCommand);
    } catch (error) {
      log(`Failed to install required packages: ${error.message}`, colors.red);
      process.exit(1);
    }
  }
  
  // Start Flask backend
  const flaskProcess = startFlaskBackend(pythonCommand);
  
  // Wait for Flask to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Start React application
  const reactProcess = await startReactApp();
  
  // Handle process termination
  const cleanup = () => {
    log('Shutting down...', colors.yellow);
    flaskProcess.kill();
    reactProcess.kill();
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

// Run the main function
main().catch(error => {
  log(`Error: ${error.message}`, colors.red);
  process.exit(1);
});

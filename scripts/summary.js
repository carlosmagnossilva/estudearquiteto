const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  gray: "\x1b[90m"
};

setTimeout(() => {
  console.log(`
${colors.cyan}${colors.bright}🚀 HUB DE OBRAS - SERVIÇOS LOCAIS${colors.reset}
${colors.gray}------------------------------------${colors.reset}
${colors.green}Frontend:${colors.reset}     http://localhost:3000
${colors.green}BFF:${colors.reset}          http://localhost:4000
${colors.green}Hub-Core:${colors.reset}     http://localhost:5001
${colors.green}Integrator:${colors.reset}   [Worker Mode]
${colors.gray}------------------------------------${colors.reset}
`);
}, 5000);

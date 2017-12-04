/**
 * process.argv
 * 返回一个数组，该数组包含了启动 Node.js 进程时的命令行参数，第一个为node.exe的路径，第二个为js文件路径
 * 命令：node process-argv.js a b c=d e
 * 输出：
 * 0: node.exe的路径
 * 1: process-argv.js 文件的路径
 * 2: a
 * 3: b
 * 4: c=d
 * 5: e
 */
process.argv.forEach((val, index) => {
  console.log(`${index}: ${val}`);
});
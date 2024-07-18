#!/bin/sh
WORKING_DIR=${PWD}
STATIC_NAME=official_help
STATIC_DIR=${WORKING_DIR}/..

# 创建目录
mkdir dist

# 静态文件编译
npm install -g pnpm@8.8.0
pnpm config set registry https://registry.npmmirror.com
cd ${WORKING_DIR}/..
make install
make dist
cp -r ${STATIC_DIR}/dist/* ${WORKING_DIR}/dist
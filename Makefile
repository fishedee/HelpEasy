.PHONY:build dev diffHead
install:
	pnpm install
	cd contents && pnpm install
build:
	rm -rf .dumi/tmp-production
	rm -rf .dumi/tmp
	rm -rf docs
	mkdir docs docs/all
	cd contents && pnpm run build
dist:build
	pnpm build
dev:build
	pnpm start
diffHead:
	git difftool --dir-diff HEAD

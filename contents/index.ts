import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface Config {
    title: string;
    author: string;
    inputDir: string;
    outputDir: string;
    category: ConfigCategory[];
}

interface ConfigCategory {
    name: string;
    articleOrder: string;
}

class Article {
    content: string;
    title: string;
    date: Date;
    pagePath: string;
    fileName: string;
    order: number;

    constructor(fileName: string, content: string) {
        if (fileName.length < 15) {
            throw new Error(`文件名【${fileName}】不正确，需要形如2023-10-23-xxx的形式`);
        }
        const dateStr = fileName.substring(0, 10);
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            throw new Error(`文件名【${fileName}】不正确，需要形如2023-10-23-xxx的形式`);
        }
        this.title = fileName.substring(11, fileName.length - 3);
        const titleHash = crypto.createHash('md5').update(this.title).digest('hex');
        this.pagePath = titleHash.substring(0, 8);

        this.content = content.replace(/!\[\]\(\/public\/img/g, '![](/img');
        this.date = date;
        this.fileName = fileName;
        this.order = 0;
    }

    setOrder(order: number): void {
        this.order = order;
    }

    generateContent(category: Category, author: string): string {
        return `---
title: ${this.title}
order: ${category.order * 100 + this.order}
toc: content
group: 
  title: ${category.name}
  order: ${category.order * 100 + this.order}
---

# ${this.title}
${this.date.toISOString().split('T')[0]}     ${author}

${this.content}`;
    }

    generateIndexContent(): string {
        return `---
toc: content
---

# ${this.title}
${this.content}`;
    }

    checkValidPagePath(pagePathMap: Record<string, boolean>): void {
        let baseName = this.pagePath;
        let id = 1;
        let pagePath = baseName;
        while (pagePathMap[pagePath]) {
            pagePath = `${baseName}_${id}`;
            id++;
        }
        pagePathMap[pagePath] = true;
        this.pagePath = pagePath;
    }
}

class Category {
    name: string;
    articleOrder: string;
    articles: Article[];
    order: number;

    constructor(name: string, articles: Article[]) {
        this.name = name;
        this.articles = articles;
        this.articleOrder = 'asc';
        this.order = 0;
    }

    sortArticle(): void {
        if (this.articleOrder.toLowerCase() === 'desc') {
            this.articles.sort((a, b) => b.fileName.localeCompare(a.fileName));
        } else {
            this.articles.sort((a, b) => a.fileName.localeCompare(b.fileName));
        }
        this.articles.forEach((article, index) => article.setOrder(index));
    }

    combineConfig(category: ConfigCategory): void {
        if (category.name !== this.name) {
            throw new Error(`类目名称不一致: ${category.name} != ${this.name}`);
        }
        const order = category.articleOrder.toLowerCase().trim();
        if (order === 'desc') {
            this.articleOrder = 'desc';
        }
    }

    setOrder(order: number): void {
        this.order = order;
    }
}

class ArticleMainContent {
    private content: string[];
    title: string;

    constructor() {
        this.content = [];
        this.title = '';
    }

    setTitle(title: string): void {
        this.title = title;
    }

    writeCategory(category: Category): void {
        this.content.push(`\n### ${category.order + 1} ${category.name}\n`);
    }

    writeArticle(article: Article): void {
        this.content.push(`* [${article.title}](/all/${article.pagePath}) `);
    }

    toArticle(): Article {
        const content = this.content.join('\n');
        return new Article(`2000-01-01-${this.title}.md`, content);
    }
}

function readConfig(fileName: string): Config {
    const fileInfo = fs.readFileSync(fileName, 'utf8');
    return JSON.parse(fileInfo) as Config;
}

function readCategory(dir: string): Category[] {
    const categoryList: Category[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const dirName = entry.name;
            const articles = readArticlesInDir(dirName);
            const category = new Category(dirName, articles);
            categoryList.push(category);
        }
    }
    return categoryList;
}

function readArticlesInDir(dir: string): Article[] {
    const articles: Article[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isDirectory() && entry.name.endsWith('.md')) {
            const filePath = path.join(dir, entry.name);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            articles.push(new Article(entry.name, fileContent));
        }
    }
    return articles;
}

function combineCategoryWithConfig(categoryList: Category[], configCategoryList: ConfigCategory[]): Category[] {
    const categoryMap: Record<string, Category> = {};
    for (const category of categoryList) {
        categoryMap[category.name] = category;
    }

    const result: Category[] = [];
    for (let index = 0; index < configCategoryList.length; index++) {
        const configCategory = configCategoryList[index];
        const category = categoryMap[configCategory.name];
        if (!category) {
            throw new Error(`没有找到类目【${configCategory.name}】`);
        }
        category.combineConfig(configCategory);
        category.setOrder(index);
        category.sortArticle();
        result.push(category);
    }
    return result;
}

function writeCategory(categoryList: Category[], title: string, author: string, outputDir: string): number {
    const pagePathMap: Record<string, boolean> = {};
    let articleCount = 0;
    const mainContent = new ArticleMainContent();
    mainContent.setTitle(title);

    for (const category of categoryList) {
        mainContent.writeCategory(category);
        for (const article of category.articles) {
            mainContent.writeArticle(article);

            articleCount++;
            article.checkValidPagePath(pagePathMap);

            const content = article.generateContent(category, author);

            const filePath = path.join(outputDir, 'all', `${article.pagePath}.md`);
            fs.writeFileSync(filePath, content);
        }
    }

    const mainArticleContent = mainContent.toArticle().generateIndexContent();
    const filePath = path.join(outputDir, 'index.md');
    fs.writeFileSync(filePath, mainArticleContent);

    return articleCount;
}

function main() {
    const args = process.argv;
    if (args.length < 3) {
        throw new Error('请传入配置文件地址，例如：ts-node script.ts ./config.json');
    }

    const beginTime = Date.now();
    console.log('读取配置中...');
    const config = readConfig(args[2]);

    console.log('读取文件中...');
    let categoryList = readCategory(config.inputDir);

    console.log('写入文件中...');
    categoryList = combineCategoryWithConfig(categoryList, config.category);
    const articleCount = writeCategory(categoryList, config.title, config.author, config.outputDir);

    const duration = Date.now() - beginTime;
    console.log(`完成转换【${articleCount}】个Markdown文件，耗时【${duration}ms】`);
}

main();
/*
 * @Name: 
 * @Description: 
 * @Author: 刘燕保
 * @Date: 2022-03-10 17:30:31
 */
// ts -> .d.ts 翻译文件 -> js
import superagent from 'superagent'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

interface titleCont {
  title: string
}

interface Result {
  time: number,
  data: titleCont[]
}

interface Content {
  [pName: number]: titleCont[]
}

class Crowller {
  private secret = 'secretKey';
  private url = 'https://www.icauto.com.cn/baike/57/578604.html'
  private rawHtml = ''

  getCourseInfo(html: string) {
    const $ = cheerio.load(html)
    const lookmores = $('.lookmore')
    const result:Array<titleCont> = []
    lookmores.map((index, ele) => {
      const markTxt = $(ele).find('.mark')
      result.push({title: markTxt.text()})
    })

    return {
      time: new Date().getTime(),
      data: result
    }
  }

  async getRawHtml() {
    const result = await superagent.get(this.url)
    return result.text
  }

  generateJsonContent(courseResult: Result) {
    const filePath = path.resolve(__dirname, '../data/course.json')
    let fileContent: Content = {}
    if (fs.existsSync(filePath)) {
      fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
    fileContent[courseResult.time] = courseResult.data
    fs.writeFileSync(filePath, JSON.stringify(fileContent))
  }

  async initSpiderProcess() {
    const html = await this.getRawHtml()
    const courseResult = this.getCourseInfo(html)
    this.generateJsonContent(courseResult)
  }

  constructor() {
    this.initSpiderProcess();
  }
}

const crowller = new Crowller()

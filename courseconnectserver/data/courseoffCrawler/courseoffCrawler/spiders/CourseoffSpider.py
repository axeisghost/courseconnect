import scrapy

class CourseoffSpider(scrapy.Spider):
    name = "Courseoff"
    allowed_domains = ["soc.courseoff.com"]
    start_urls = [
        "https://soc.courseoff.com/gatech/terms/"
    ]

    def parse(self, response):
        filename = "courseoff"
        with open(filename, 'wb') as f:
            f.write(response.body)
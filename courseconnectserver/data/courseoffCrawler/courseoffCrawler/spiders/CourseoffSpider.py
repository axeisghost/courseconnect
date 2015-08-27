import scrapy
import json
from pymongo import MongoClient

class CourseoffSpider(scrapy.Spider):
	client = MongoClient("http://localhost:27017/")
	db = client.courseoff
    allowed_domains = ["soc.courseoff.com"]

    start_urls = [
        "https://soc.courseoff.com/gatech/terms/"
    ]

    def parse(self, response):
        filename = "courseoff"
        with open(filename, 'wb') as f:
            f.write(response.body)
import datetime
from tqdm import tqdm
from bs4 import BeautifulSoup
import hashlib
import requests
import xml.etree.ElementTree as ET
import newspaper
from random import shuffle
import threading
import numpy as np
import sqlite3
import nltk
import multiprocessing
import html2text
import justext
import os
import json

nltk.download('punkt')

# google


def fetch_google():
    articles = []

    # First get the base news and then get the sections
    articles = articles + parse_generic("https://news.google.com/news/rss", [""])

    base = "https://news.google.com/news/rss/headlines/section/topic/"
    urls = ["WORLD", "NATION", "BUSINESS", "TECHNOLOGY",
            "ENTERTAINMENT", "SPORTS", "SCIENCE", "HEALTH"]

    articles = articles + parse_generic(base, urls)
    
    return list(set(articles))

# CNN


def fetch_cnn():
    articles = []

    base = "http://rss.cnn.com/rss/"

    urls = ["cnn_topstories.rss", "cnn_world.rss", "cnn_us.rss", "money_latest.rss",
            "cnn_allpolitics.rss", "cnn_tech.rss", "cnn_health.rss", "cnn_showbiz.rss", "cnn_latest.rss"]

    return list(set(parse_generic(base, urls)))



def parse_generic(base, urls, post = ""):
    articles = []

    for url in urls:
        try: 
            r = requests.get(base + url + post)
            tree = ET.fromstring(r.text)[0]

            link = [elem.text.rstrip() for elem in tree.iter() if elem.tag == 'link']
            articles = articles + link

        except Exception as e:
            print(e)
            continue

    return articles
# CNBC


def fetch_cnbc():
    articles = []

    base = "https://www.cnbc.com/id/"
    post = "/device/rss/rss.html"

    # TODO: there's a lot, picked a few
    urls = ["100003114", "100727362", "15837362", "19832390", "19794221",
            "10001147", "20910258", "10000664", "10000113", "10000115", "10000108"]

    return list(set(parse_generic(base, urls, post)))


# reuters

def fetch_reuters():
    articles = []

    base = "http://feeds.reuters.com/reuters/"

    # TODO: there's a lot, picked a few
    urls = ["businessNews", "companyNews", "entertainment", "environment", "healthNews", "lifestyle", "oddlyEnoughNews",
            "peopleNews", "politicsNews", "scienceNews", "sportsNews", "technologyNews", "topNews", "domesticNews", "worldNews"]



    return list(set(parse_generic(base, urls)))


def fetch_guardian():
    articles = []

    base = "https://www.theguardian.com/"

    urls = ["us/rss", "uk/rss"]

    return list(set(parse_generic(base, urls)))


def fetch_pew():
    articles = []

    base = "http://www.pewresearch.org/feed/"

    return list(set(parse_generic(base, [""])))


def fetch_fox():
    articles = []

    base = "http://feeds.foxnews.com/foxnews/"

    urls = ["most-popular", "opinion", "politics", "national", "world"]

    return list(set(parse_generic(base, urls)))


def fetch_ap():
    # AP doesn't have RSS

    articles = []
    base = "https://www.apnews.com"

    r = requests.get(base).text
    html = BeautifulSoup(r, features='lxml')

    # all headline are linked from homepage
    links = html.find_all('a', class_='headline')
    for link in links:
        href = link.get('href')
        if 'http' in href:
            continue
        articles.append(base + href)

    return list(set(articles))


def fetch_hill():
    articles = []

    # TODO: Look at more of these
    base = "https://thehill.com"
    urls = ["/rss/syndicator/19110", "/taxonomy/term/1132/feed", "/taxonomy/term/1130/feed", "/taxonomy/term/1131/feed", "/taxonomy/term/1132/feed", "/taxonomy/term/1630/feed", "/taxonomy/term/1114/feed", "/taxonomy/term/1116/feed",
            "/taxonomy/term/20/feed", "/taxonomy/term/39/feed", "/taxonomy/term/28/feed", "/taxonomy/term/30/feed", "/taxonomy/term/33/feed", "/taxonomy/term/27/feed", "/taxonomy/term/38/feed", "/taxonomy/term/43/feed", "/taxonomy/term/49/feed"]


    return list(set(parse_generic(base, urls)))

def fetch_BI():
    articles = []

    base = "http://www.businessinsider.com/"
    urls = ["latest.rss", "politics.rss", "clusterstock.rss"]

    return list(set(parse_generic(base, urls)))

def fetch_BBC():
    articles = []

    base = "http://feeds.bbci.co.uk/news"
    urls = ["/world/africa/rss.xml", "/world/asia/rss.xml", "/world/europe/rss.xml", "/world/latin_america/rss.xml", "/world/middle_east/rss.xml", "/world/us_and_canada/rss.xml", "/england/rss.xml", "/northern_ireland/rss.xml", "/scotland/rss.xml", "/wales/rss.xml", "/rss.xml?edition=uk", "/rss.xml?edition=us", "/rss.xml?edition=int"] 


    return list(set(parse_generic(base, urls)))

def fetch_reason():
    base = "http://feeds.feedburner.com/reason/AllArticles"

    r = requests.get(base)
    tree = ET.fromstring(r.text)

    link = [elem.attrib['href'] for elem in tree.iter() if elem.tag == '{http://www.w3.org/2005/Atom}link']

    return list(set(link))

def fetch_NYT():
    base = "http://rss.nytimes.com/services/xml/rss/nyt/"
    urls = ["HomePage.xml", "World.xml", "US.xml", "Business.xml", "Science.xml", "Environment.xml", "Americas.xml", "Africa.xml", "Europe.xml", "AsiaPacific.xml", "MiddleEast.xml", "Politics.xml", "Economy.xml", "EnergyEnvironment.xml"]
    
    articles = parse_generic(base, urls)
    articles = [article for article in articles if 'index.html' not in article]

    return list(set(articles))

def fetch_USATODAY():
    base = "http://rssfeeds.usatoday.com"

    urls = ["/usatoday-NewsTopStories", "/UsatodaycomWorld-TopStories", "/UsatodaycomWashington-TopStories", "/News-Opinion"]

    post = "&x=1"

    articles = parse_generic(base, urls, post)

    articles = [article for article in articles if 'http://rssfeeds.usatoday.com/' in article]

    return list(set(articles))

def fetch_538():
    articles = parse_generic("https://fivethirtyeight.com/all/feed", [""])

    articles = articles[2:]

    return list(set(articles))


sources = [("CNN", fetch_cnn), ("CNBC", fetch_cnbc), ("REUTERS", fetch_reuters),
           ("GUARDIAN", fetch_guardian), ("PEW", fetch_pew), ("FOX", fetch_fox), ("THE HILL", fetch_hill), ("AP NEWS", fetch_ap), ("BI", fetch_BI), ("BBC", fetch_BBC), ("REASON", fetch_reason), ("NYT", fetch_NYT), ("USA TODAY", fetch_USATODAY), ("538", fetch_538)]

articles = []
count = 0
counts = []

for source in tqdm(sources):
    try:
        articles = articles + source[1]()

        counts.append(source[0] + ":" + str(len(articles) - count))

        count = len(articles)
    except:
        print("failed to load: " + source[0])
        continue

for count in counts:
    print(count)

data = []
if os.path.exists('./pending'):
 in_file = open('./pending', 'rU') 
 data = in_file.read().split('\n')
 os.remove('./pending')

print('CACHE: ' + str(len(data)))
new = [a for a in data if a not in articles]
print('CACHE NEW: ' + str(len(new)))
articles = articles + new
print('TOTAL: ' + str(len(articles)))

hash_conn = sqlite3.connect('./data/hash.db')
hashes = hash_conn.cursor()

# only if this is first run
hashes.execute('''CREATE TABLE IF NOT EXISTS hash (article text unqiue, CONSTRAINT article_unique UNIQUE (article));''')

removed = 0

def check(article):
    article_hash = str(hashlib.md5(article.encode('utf-8')).hexdigest())

    hashes.execute('SELECT * FROM hash WHERE article =?', (article_hash,))

    good = hashes.fetchone() is None

    #manual filter
    if "www.youtube.com" in article:
        good = False
    
    global removed
    removed = removed + int(not good)

    return good 

articles = [article for article in articles if check(article)]

print('REMOVED: ' + str(removed))
print('LEFT:' + str(len(articles)))

if(len(articles) < 400):
    with open('./pending', 'w') as out_file:
        out_file.write('\n'.join(articles))
    exit(0)


#filter out every article in hash table


def get_article(articles, i, output):
    for article in tqdm(articles):
        try:
            a = newspaper.Article(article)
            a.download()
            a.parse()
            a.nlp()

            paragraphs = justext.justext(a.html, justext.get_stoplist("English"))
            text = '\n\n'.join([p.text for p in paragraphs if not p.is_boilerplate])

            if(len(text) > len(a.text)+50):
                a.set_text(text)

            h = html2text.HTML2Text()
            h.ignore_links = True
            h.ignore_images = True

            a.set_html(h.handle(a.html))
            
        except Exception as e:
            print(e)
            continue

        # TODO: config option?
        if len(a.text) < 400:
            continue

        output.append(a)


# avoid rate limting
shuffle(articles)

# break up data for each thread


def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in range(0, len(l), n):
        yield l[i:i + n]


threads = multiprocessing.cpu_count()

data = np.array(list(chunks(articles, len(articles)//threads)))

out = []
jobs = []
for i in range(0, threads):
    out_list = list()
    thread = threading.Thread(target=get_article, args=(data[i], i, out))
    jobs.append(thread)

# Start the threads (i.e. calculate the random number lists)
for j in jobs:
    j.start()

# Ensure all of the threads have finished
for j in jobs:
    j.join()



current = os.listdir('./data')

now = datetime.datetime.now()
conn = sqlite3.connect('./data/' + str(len(current)+1) + '.db')
c = conn.cursor()

c.execute('''CREATE TABLE IF NOT EXISTS articles (url text, title text, date text, article text, keywords text, summary text, html text, md5 text unique)''')

count = 0

counter = json.load(open('data.json'))

for article in tqdm(out):
    article_hash = str(hashlib.md5(article.url.encode('utf-8')).hexdigest())

    try:
        hashes.execute('INSERT INTO hash VALUES (?);', (article_hash,))
    except Exception as e:
        print(e)
        continue

    if article.publish_date is None:
        date = datetime.datetime.now().strftime("%m/%d/%Y") + '?'
    else:
        date = article.publish_date.strftime("%m/%d/%Y")

    try:
        # TODO: Put HTML here
        c.execute('INSERT INTO articles VALUES (?,?,?,?,?,?,?,?);', (article.url, article.title,
                                                                   date, article.text, ','.join(article.keywords), article.summary, article.html, article_hash))
    except:
        continue


    source = article.url.split('.com')[0]
    source = source.split('.co.uk')[0]
    source = source.split('.org')[0]
    source = source.split('.net')[0]

    test_split = source.split('http://')
    source = test_split[len(test_split)-1]

    test_split = source.split('https://')
    source = test_split[len(test_split)-1]

    test_split = source.split('http://www.')
    source = test_split[len(test_split)-1]

    test_split = source.split('https://www.')
    source = test_split[len(test_split)-1]

    test_split = source.split('.')
    source = test_split[len(test_split)-1]

    if source in counter:
        counter[source] = counter[source]+1
    else:
        counter[source] = 1

    count += 1

print("Loaded " + str(count) + " new articles")
conn.commit()
conn.close()

hash_conn.commit()
hash_conn.close()

file = open('data.json', 'w')
json.dump(counter, file)
file.close()

print(dict(sorted(counter.items(), key=lambda x: x[1])))

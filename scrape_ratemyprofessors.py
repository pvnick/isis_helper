import urllib2
import MySQLdb
import sys

from bs4 import BeautifulSoup

con = None
allLetters = map(chr, range(65, 91))

print("Scraping data for all professors")

for letter in allLetters:
    print("Looking up all teachers whose name starts with " + letter)
    url = "http://www.ratemyprofessors.com/SelectTeacher.jsp?the_dept=All&sid=1100&orderby=TLName&letter=" + letter

    response = urllib2.urlopen(url)
    html = response.read()
    soup = BeautifulSoup(html)
    nameLabels = soup.findAll("div", {"class": "profName"})
    for nameLabel in nameLabels:
        nameLabelHTML = nameLabel.prettify()
        if ("ShowRatings.jsp" in nameLabelHTML):

            #valid professor name
            link = nameLabel.find("a")
            if (link != None):
                linkHref = link["href"]
                idLoc = linkHref.find('tid=') + 4
                tID = (int)(linkHref[idLoc:])
                name = link.text
                commaLoc = name.find(",")
                firstName = name[(commaLoc + 2):]
                lastName = name[:commaLoc]
                fullTextName = lastName + "," + firstName

                print("Adding " + fullTextName + ", ID=" + str(tID))
                #try inserting the professor name into the database
                try:
                    conn = MySQLdb.Connection(user="user", passwd="pass", db="isis_help", host="localhost")
                    c = conn.cursor()
                    c.execute("INSERT IGNORE INTO teachers (LastName, FullTextName, RateMyProfessorID) VALUES (%s, %s, %s)", (lastName, fullTextName, tID))
                except MySQLdb.Error, e:
                    print ("Error %d: %s" % (e.args[0], e.args[1]))
                finally:
                    if conn:
                        conn.commit()
                        conn.close()

print("Done")

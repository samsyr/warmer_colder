# Ulkoilma peli, joka kylmenee ja kuumenee

Kun olin alle kouluikäinen, meillä oli setäni kanssa hauska leikki, jota
pelasimme usein mummolassa. Tässä kirjoituksessa muodostamme leikkimme ideasta
sovelluksen, jonka tarkoituksena on auttaa käyttäjäänsä kartoittamaan
lähiympäristöään.

Perheemme on juuri muuttanut uuteen kaupunkiin, joten tällainen ulkoilun
kynnystä madaltava sovellus sopisi omaan käyttööni kuin nenä päähän. Kerron
seuraavassa kappaleessa säännöt, jotka toimivat samalla myös Claude Codelle
annettavana mobiilisovelluksen spesifikaationa. Me leikimme tätä leikkiä
mummolan talon sisällä, mutta nyt leikkikenttä laajenee GPS-sijainnin avulla
oikeaan ympäristöön ja karttoihin. Seuraavaksi säännöt.

Alkutilanteessa olemme pisteessä A, ja tarkoituksena on löytää pisteeseen B. Kun
liikun johonkin suuntaan, setäni sanoo joko “lämpenee” tai “kylmenee”. Setäni
pystyi luonnollisesti hieman säätämään ohjauskäskyjen tiheyttä suhteessa
etsimisen tilanteeseen. Oikea suunta voidaan kuitenkin varmistaa, jos
lämpenee/kylmenee-ohjeita saadaan tarpeeksi usein. Tämä on tärkeää, koska
käyttäjä voi teoriassa olla liikkeellä jalan, pyörällä, sähköskuutilla tai jopa
autolla. Asetetaan siis aluksi ohjauskäskyjen vakioväliksi 10 sekuntia.

Tuodaan mukaan vielä GPS-paikannuksessa tarvittava lisätieto: etäisyys
kohteeseen. Tästä saamme lopullisen speksin: mobiililaite kertoo 10 sekunnin
välein, olemmeko lähempänä vai kauempana kohteesta verrattuna edelliseen
mittauspisteeseen sekä kuinka pitkä matka linnuntietä perille vielä on.

Tältä pohjalta haluamme erityisesti vibe-koodaamalla tuottaa kyseisen
mobiilisovelluksen. Tätä varten meitä kiinnostaa selvittää, mikä olisi hyvä
teknologiastäkki projektin toteuttamiseen. Ensimmäinen määränpää on rakentaa
PoC-sovellus, joka MVP-mittakaavassa testaa, onko ideamme käyttökelpoinen.
Perusidea on todella yksinkertainen: pelkkä kylmenee/lämpenee-ohjaus riittää
lopulta ohjaamaan käyttäjän perille.

Käynnistyessään sovelluksen pitää kysyä käyttäjältä kohteen koordinaatit.
Säännöllisin väliajoin tapahtuvissa ohjauspisteissä sovellus antaa käyttäjälle
kuvatun äänipalautteen sekä tallentaa käyttäjän koordinaatit tekstitiedostoon
omalle rivilleen. Kun käyttäjä pääsee sadan metrin etäisyydelle kohteesta,
sovellus onnittelee käyttäjää kohteen löytämisestä äänipalautteella ja sulkee
itsensä.

Minulla on vahva halu saada tämä sovellus toimimaan, sillä kuten kerroin jo
aiemmin, se tulisi minulle välittömästi hyötykäyttöön uuden paikkakunnan
kartoittamisessa kävellen, lenkkeillen ja pyöräillen. Lisäksi se osoittaisi jo
edesmenneen setäni kautta, että ihmisen tekojen seuraukset voivat elää vahvasti
vielä senkin jälkeen, kun aika ihmisestä jättää.

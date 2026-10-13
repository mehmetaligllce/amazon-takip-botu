package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type Product struct {
	Name      string `json:"name"`
	Price     string `json:"price"`
	URL       string `json:"url"`
	InStock   bool   `json:"inStock"`
	ScrapedAt string `json:"scrapedAt"`
}

func parsePrice(url string) Product {
	scrapedAt := time.Now().Format(time.RFC3339)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return Product{
			Name:      "İstek oluşturma hatası: " + err.Error(),
			Price:     "",
			URL:       url,
			InStock:   false,
			ScrapedAt: scrapedAt,
		}
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
	req.Header.Set("Accept-Language", "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return Product{
			Name:      "Bağlantı hatası: " + err.Error(),
			Price:     "",
			URL:       url,
			InStock:   false,
			ScrapedAt: scrapedAt,
		}
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return Product{
			Name:      "HTTP Hatası: " + res.Status,
			Price:     "",
			URL:       url,
			InStock:   false,
			ScrapedAt: scrapedAt,
		}
	}

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return Product{
			Name:      "HTML okuma hatası: " + err.Error(),
			Price:     "",
			URL:       url,
			InStock:   false,
			ScrapedAt: scrapedAt,
		}
	}

	name := strings.TrimSpace(doc.Find("#productTitle").First().Text())

	isStock := doc.Find("#add-to-cart-button").Length() > 0 || doc.Find("#buy-now-button").Length() > 0 || doc.Find("#submit.add-to-cart").Length() > 0

	var price string
	whole := strings.TrimSpace(doc.Find(".a-price-whole").First().Text())
	whole = strings.TrimSuffix(whole, ",")
	whole = strings.TrimSuffix(whole, ".")
	fraction := strings.TrimSpace(doc.Find(".a-price-fraction").First().Text())

	if whole != "" {
		if fraction != "" {
			price = whole + "," + fraction + " TL"
		} else {
			price = whole + " TL"
		}
	} else {
		price = strings.TrimSpace(doc.Find(".a-price .a-offscreen").First().Text())
		if price == "" {
			price = strings.TrimSpace(doc.Find("#priceblock_ourprice").Text())
		}
	}

	if name == "" && price == "" {
		return Product{
			Name:      "Amazon Bot Korumasına Takıldı (CAPTCHA). Lütfen biraz bekleyip tekrar deneyin.",
			Price:     "",
			URL:       url,
			InStock:   false,
			ScrapedAt: scrapedAt,
		}
	}

	return Product{
		Name:      name,
		Price:     price,
		URL:       url,
		InStock:   isStock,
		ScrapedAt: scrapedAt,
	}
}

func main() {
	http.HandleFunc("/api/price", handlePrice)
	http.ListenAndServe(":5000", nil)
}

func handlePrice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, "Yalnızca GET destekleniyor", http.StatusMethodNotAllowed)
		return
	}

	amazonUrl := r.URL.Query().Get("url")
	if amazonUrl == "" {
		http.Error(w, `{"error": "url parametresi eksik"}`, http.StatusBadRequest)
		return
	}

	json.NewEncoder(w).Encode(parsePrice(amazonUrl))
}

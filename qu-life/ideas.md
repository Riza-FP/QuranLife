# Qu-life - Alat untuk memperkuat hubungan kehidupan kita dengan Quran
Sebuah mobile app yang menampilkan ayat dalam satu page view per ayat, untuk mempermudah menghayati sebuah ayat per ayat:
	- untuk memberi ruang mengingat makna per ayat, dengan navigasi per ayat
	- untuk memberi ruang mengingat ayat per ayat itu sendiri, 
Dengan navigasi yang mudah untuk:
- menjalankan audio di ayat tersebut
- membuka terjemahan di ayat tersebut
- dll

## Fitur besar
- dimulai dengan daftar surah yang telah tersedia
- page view untuk per ayat, dimulai dengan ayat pertama, dan di ayat yang terakhir dibuka nantinya
- action di setiap page view
	- top menu
		- back
		- setting
			- default terjemahan
			- default audio
			- font size
		- play auto
	- swap right to navigate next ayat, left to previous		
	- bottom menu
		- play ayat audio
		- play terjemah audio
		- open terjemahan default
		- menu tambahan
			- open terjemahan lainnya
			- custom auto play 
				- delay antar ayat
				- delay antar ayat dan audio
				- pengulangan per ayat
				- pengulangan per surah
			
## struktur konten

### list of surah in csv
	- nomor, kode, nama, jumlah_ayat
	- 78,naba, An Naba,40
	- 79,naziat,An Naziat,46
	-
###  file konten (audio / text)
- folder
	- naba
		- arabic
			- naba_1.txt
			- naba_xxx.txt
			- naba_40.txt
		- tr_id
			- naba_1.txt
			- naba_xxx.txt
			- naba_40.txt
		- tr_msr
			- naba_1.txt
			- naba_xxx.txt
			- naba_40.txt				
		- aud_id
			- naba_1.mp4a
			- naba_xxx.mp4a
			- naba_40.mp4a								
		- aud_en
			- naba_1.mp4a
			- naba_xxx.mp4a
			- naba_40.mp4a
	- naziat
			
### terjemahan teks code csv
	- kode, nama, bahasa
	- tr_id, Kemenag, Indonesia)
	- tr_msr_id, Muyassar (ID), Indonesia
	- tr_en_jl, Jalalayn (EN), English
	
### audio name code csv
	- kode, nama, bahasa
	- aud_id, Indonesia-1, Indonesia
	- aud_en, English-1, English

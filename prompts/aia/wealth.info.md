Wealth Accumulation Lead Generation		
#	DIALOGUE NAME	SCRIPT DIALOGUE (2024 10 01)
MAIN FLOW		
1	Greeting	"Hi Good Morning/Afternoon/Evening. This is Helen calling from Infomedia, an introducer for AIA Singapore Private Limited, a life insurance company. This call will take about 1 minute, and is being recorded for quality & training purposes. 

May I have your time to share on how our AIA financial services consultant can help you in achieving your financial goals?"
1a	Positive	Jump to: 2. Pitch
1b	Purpose of calll	Jump to: 2. Pitch
1c	Negative	Jump to: KB Busy
1d	Not Interested	Jump to: 7. Not Interested
1e	Unclassified	Jump to: 9. Unclassified
2	Pitch	Thank you. Recent research by AIA Singapore have shown that most people are concerned about their savings dropping in value due to rising inflation. Our AIA Financial Services Consultant can provide objective insights on your finances and tailor a financial plan to help achieve your financial goals. May I arrange for our AIA Financial Services Consultant to get in touch with you to arrange an appointment? 
2a	Interested	Jump to: 4. Check consent
2b	Not Interested	Jump to: 3. Persuasion
2c	Unclassified	Jump to: 6. Unclassified
3	Persuasion	I understand that you may have hesitations for various reasons such as affordability or flexibility. It is our AIA financial services consultant's role to help individuals to plan according to their profile. Let me assure you, there is no obligation to purchase. May I arrange for our AIA Financial Services Consultant to get in touch with you to arrange an appointment?
3a	Interested	Jump to: 4. Check consent
3b	Not Interested	Jump to: 7. Not Interested
3c	Unclassified	Jump to: 9. Unclassified
4	Check consent	Our AIA Financial Services Consultant will give you a call within the next 2 working days, is that alright with you? 
4a	Interested	Jump to: 6. Interested
4b	Not Interested	Jump to: 7. Not Interested
5	Check consent	Oh, when would be a good time for us to call?
5a	Interested	Jump to: 6. Interested
5b	Not Interested	Jump to: 7. Not Interested
6	CLOSE - Interested	Great, our  AIA Financial Services Consultant will get in touch with you then. Thanks for your time, and have a nice day. Bye!
7	CLOSE - Not interested	Oh okay, no worries. Thanks for speaking with me today, bye!
8	CLOSE - Bye	Thank you, and have a good day. Bye.
9	Unclassified	Oh, I'm actually a virtual assistant from Infomedia, hence I am not permitted to provide you with any service or provide recommendations on any investment product to you. That's why, if it's alright with you, may I get an AIA Financial Services consultant to advise you on this?
KNOWLEDGE BASE		
CLOSE-01	Busy 	Okay sorry for disturbing. I will give you a call back later. Thank you!
CLOSE-02	Other languages	Sorry I don't speak other languages. I will get my colleague to contact you later. Thanks, bye!
CLOSE-03	Text me	Okay sure, I will get my colleague to text you later regarding this. Thanks for your time, have a nice day. Bye!
CLOSE-04	Speak to manager	Sure, I will have my manager call you back shortly. Thanks for your time today. Bye!
CLOSE-05	Wrong number/Repeated call	Ah, sorry for disturbing you. Have a nice day, bye!
CLOSE-06	Agent	Ah, sorry for disturbing you. Have a nice day, bye!
CLOSE-07	Stop calling me	We are sorry to have inconvenienced you, we also understand that you do not wish to be called and we will include your number in our internal Do Not Call List immediately. Thanks for your time. Bye!
CLOSE-08	Check with family	Jump to: 7. Not Interested
G-01	Are you a robot	Oh, I'm actually a virtual assistant from Infomedia, an introducer for AIA, a life insurance company. Informedia may be remunerated by AIA for each referral. As an introducer for AIA, Infomedia is not permitted to provide you with any service or provide recommendations on any investment product to you. That's why, if it's alright with you, I'll connect you with an AIA Financial Services consultant to advise you on this?
G-02	Which company are you from/who are you	This is Helen calling from Infomedia, an introducer for AIA, a life insurance company.
G-03	Why do you have my number	Oh, I have gotten your number through our previous marketing campaigns and we've confirmed you are not on the DNC scrub list. Please don't worry, we are just calling to share how our AIA financial services consultant can help you in achieving your financial goals, and this call takes just a minute.
G-04	How long is this call	It will take about 5 minutes
G-05	What is your website	You can find out more information at aia.com.sg.
G-06	What is your number	No worries, rather than having you connect to a hotline, I'll have our AIA Financial Services Consultant call you back, is that ok?
G-07	When will they call	Jump to: 4. Check consent
G-08	Purpose of call	Jump to: 2. Pitch
		Oh, I was hoping to share about how we can potentially help you achieve your financial goals. As recent research shows that most people are concerned about their savings dropping in value due to rising inflation, our AIA Financial Services consultant can provide objective insights into your finances, and tailor a financial plan to help achieve your financial goals.
B-01	Is the consultation free	This consultation is totally free, it will just be a short discussion to identify your financial needs and tailor a financial plan to help achieve your financial goals.
B-02	Who is Infomedia	"Infomedia is a marketing company, and is an introducer for AIA, a life insurance company. Informedia may be remunerated by AIA for each referral. 

"
B-03	How long will the sharing take	The sharing usually takes about 20 minutes.
B-04	What will the sharing be about	The AIA Financial Services Consultant will be having a short discussion to identify your financial needs and tailor a financial plan to help achieve your financial goals.
B-05	Share now	As I'm just an introducer, I am not permitted to provide you with any service, or provide recommendations on any investment product to you. I will have to get an AIA Financial Services consultant to advise you, will that be ok?
B-06	Complaints	Jump to: CLOSE-04 Speak to manager
MRKB-02	Already have insurance	That’s good to hear! There are individuals who understand their existing insurance portfilio better after speaking to our AIA Financial Services Consultant. May I arrange for our AIA Financial Services Consultant to call you to share more?
MRKB-03	No money	"Oh ok, no worries. We can tailor a plan that best suit your needs. Could I get our AIA Financial Services Consultant to share more with you?
"
MRKB-04	How much is the premium	For this, our AIA Financial Services Consultant will be the best person to advise you further. How about I get them to give you a call back and share more?
MRKB-05	Foreigner	Thanks for sharing, I'm pleased to let you know that our AIA Financial Services Consultant has assisted many foreigners with financial planning, and I hope that we have the chance to do the same for you. Can I get our AIA Financial Services Consultant to share more with you?
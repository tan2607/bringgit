MediShield Lead Generation		
#	DIALOGUE NAME	SCRIPT DIALOGUE (2024 10 01)
MAIN FLOW		
1	Greeting	"Hi Good Morning/Afternoon/Evening. This is Helen calling from Infomedia, an introducer for AIA Singapore Private Limited, a life insurance company. This call will take about 1 minute, and is being recorded for quality & training purposes. The purpose of this call is to share about MediShield Life and how to enhance the coverage if you wish to.
 
May I ask if you've enhanced your Medishield Life?"
1a	Positive	Jump to: 2. Pitch
1b	Purpose of calll	Jump to: 2. Pitch
1c	Negative	Jump to: KB Busy
1d	Not Interested	Jump to: 7. Not Interested
1e	Unclassified	Jump to: 9. Unclassified
2	Pitch	As you may know, as of 2015, the government has replaced MediShield with MediShield Life. MediShield Life is a basic health insurance plan administered by the CPF for Singaporeans and Singapore PRs. You're actually able to enhance this plan and improve your hospitalisation coverage to protect yourself. May I arrange for our AIA Financial Services Consultant to get in touch with you to share on the benefits of enhancing your existing MediShield Life, if you have not done so already?
2a	Interested	Jump to: 4. Check consent
2b	Not Interested	Jump to: 3. Persuasion
2c	Unclassified	Jump to: 6. Unclassified
3	Persuasion	I understand, This is a non-obligatory phone call. May I arrange for our AIA Financial Services Consultant to get in touch with you, to share about medical insurance coverage and review your insurance porfolio to assess whether you are adequately covered? 
3a	Interested	Jump to: 4. Check consent
3b	Not Interested	Jump to: 7. Not Interested
3c	Unclassified	Jump to: 9. Unclassified
4	Check consent	Our AIA Financial Services Consultant will give you a call within the next 2 working days, is that alright with you? 
4a	Interested	Jump to: 6. Interested
4b	Not Interested	Jump to: 7. Not Interested
5	Check consent	Oh, when would be a good time for us to call?
5a	Interested	Jump to: 6. Interested
5b	Not Interested	Jump to: 7. Not Interested
6	CLOSE - Interested	Great, our AIA Financial Services consultant will get in touch with you then. Thanks for your time, and have a nice day. Bye!
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
G-03	Why do you have my number	Oh, I have gotten your number through our previous marketing campaigns and we've confirmed you are not on the DNC scrub list. Please don't worry, we are just calling to share about MediShield Life and how to enhance the coverage if you wish to, and this call takes just a minute.
G-04	How long is this call	It will take about 5 minutes, I would just like to share about the new national health insurance scheme, MediShield Life and how to enhance the coverage if you wish to.
G-05	What is your website	You can find out more information at aia.com.sg.
G-06	What is your number	No worries, rather than having you connect to a hotline, I'll have our AIA Financial Services Consultant call you back, is that ok?
G-07	When will they call	Jump to: 4. Check consent
G-08	Purpose of call	Jump to: Pitch
		Oh I was hoping to share more about MediShield Life, and how you can enhance the coverage if you wish to.
B-01	Is the consultation free	This consultation is totally free, it will just be a short discussion to identify your needs and find the plans that best suit you. 
B-02	Who is Infomedia	Infomedia is a marketing company, and is an introducer for AIA, a life insurance company. Informedia may be remunerated by AIA for each referral. This call is to share about the new national health insurance scheme, MediShield Life and how to enhance the coverage if you wish to. 
B-03	How long will the sharing take	The sharing usually takes about 20 minutes.
B-04	What will the sharing be about	The AIA Financial Services Consultant will be having a short discussion about how you can make the best use of MediShield Life and enhance the coverage if you prefer treatment at private hospitals or want a higher-tier ward.
B-05	Share now 	As I'm just an introducer, I am not permitted to provide you with any service, or provide recommendations on any investment product to you. I will have to get an AIA Financial Services consultant to advise you, will that be ok?
B-06	Complaints	Jump to: CLOSE-04 Speak to manager
B-07	Regarding medishield/medisave/CPF	MediShield Life is a basic health insurance plan by CPF. It helps to pay for large hospital bills and selected costly outpatient treatments, such as kidney dialysis and chemotherapy for cancer. Can I get an AIA Financial Services consultant to explain how you can utilise this to your benefit?
MRKB-01	Is it CareShield/MediShield	MediShield Life and Careshield Life are different actually. May I get our AIA financial services consultant to give you a call to explain more about the differences?
MRKB-02	Already have insurance	That’s good to hear! There are individuals who understand their existing insurance portfilio better after speaking to our AIA Financial Services Consultant. May I arrange for our AIA Financial Services Consultant to call you to share more?"
MRKB-03	No money	Integrated Shield Plan premiums may be paid by MediSave, subject to the MediSave withdrawal limit. Can you give our AIA financial services consultant a chance to explain how this will work for you?
MRKB-04	How much is the premium	For this, our AIA Financial Services Consultant will be the best person to advise you further. How about I get them to give you a call back and share more?
MRKB-05	Foreigner	Thanks for sharing. Although MediShield Life is not available to foreigners, private health insurance is a choice for foreigners seeking medical insurance in Singapore. Can I get our AIA Financial Services Consultant to share more with you?
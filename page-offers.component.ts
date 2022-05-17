import { formatDate } from "@angular/common";
import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { LoadingController, ModalController } from "@ionic/angular";

import { ApiService } from "src/app/services/api/api.service";
import { PageControllerService } from "src/app/services/page-controller/page-controller.service";
import { DOCViewerComponent } from "../docviewer/docviewer.component";

@Component({
  selector: "page-offers",
  templateUrl: "./page-offers.component.html",
  styleUrls: ["./page-offers.component.css"],
})
export class PageOffersComponent implements OnInit {
  @Input()
  applicant: any;

  @Input()
  brandName: string;

  public brandColor: string;

  public applyResponse: any;
  public offers: any;
  @Input()
  locationInfo: any;
  disableButton: boolean = true;
  applicationDisclosure: boolean = false;
  cardAgreement: boolean = false;

  constructor(
    public pageCtrl: PageControllerService,
    public loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    public api: ApiService
  ) {}

  ngOnInit() {

    if (this.applicant) {
      this.applyResponse = this.applicant.applicationOutcome;
      const offerTemp = this.applicant.applicationOutcome?.offers;

      if (offerTemp && Array.isArray(offerTemp)) {
        this.offers = offerTemp.map(item => {
          item.checked = false;
          return item;
        })
      }
    }

    this.brandColor = "#0076a9";
    if (this.brandName == "Aspire") {
      this.brandColor = "#009490";
    }
  }
  termsAgree() {
    this.checkButtonDisable();
  }
  checkButtonDisable() {
    if(this.cardAgreement && this.applicationDisclosure 
      && this.offers.filter(res => res.checked).length > 0) {
        this.disableButton = false;
      }else {
        this.disableButton = true;
      }
  }
  public async openSummary(type) {
    let pdfPayload = {
      "applicant": this.applicant,
      "formatType":"BOTH",
      "info": this.locationInfo,
      "crossSellInfo":{
        "referenceStateProvinceId":"GA"
      }
    }
    if(type === "getSummary"){
      let title = this.pageCtrl.platform.translate('pageOffer.summary_of_credit_terms');
      this.openAgreementDocumentViewer(pdfPayload,type,title)

    }else if(type === "cardAgreement") {
      pdfPayload["offerId"] = 5778;
      let title = this.pageCtrl.platform.translate('pageOffer.cardholder_greement');
      this.openAgreementDocumentViewer(pdfPayload,type,title)
      
    }else if(type === "applicationDisclosure") {
      let title = this.pageCtrl.platform.translate('pageOffer.electronic_disclosures');
      this.openAgreementDocumentViewer(pdfPayload,type,title)
    } 
   
  }

  public async openAgreementDocumentViewer(pdfPayload,type,popupTitle) {
    let myopt = 'C'
    // let myopt = 'PDF'
    let docType = 'HTML';
    let myzoom = 1.10
    if(this.pageCtrl.platform.is('mobile') || this.pageCtrl.platform.is('tablet')){
      myopt = null
      myzoom = 0.93
    }

    let modal = await this.modalCtrl.create({
      component: DOCViewerComponent, // DocumentViewer
      backdropDismiss: false,
      cssClass:"mymodal-pdfviewer",
      componentProps: {
      documentKey: type,
      pdfPayload: pdfPayload,
      title: popupTitle,
      zoom:myzoom,
      pdfData:'',
      docopt:myopt,
      docType:docType
    }
    });
    await modal.present()
  }

  public onSelectOffer(data: any) {
    const checkedOfferId = data.offerId;
    this.offers = this.offers.map(o => {
      o.checked = false;

      if (o.offerId === checkedOfferId) {
        o.checked = true;
      }

      return {
        ...o
      }
    });
    this.checkButtonDisable();
  }

  public async onAcceptClick(): Promise<void> {
    let selectedOffers = this.offers.filter(c => c.checked === true);

    if (selectedOffers.length === 0) {
      alert('No Offer selected');
      return;
    }

    const selectedOffer = {
      applicationId: this.applicant.applicationOutcome.applicationId,
      acceptedOfferId: selectedOffers[0].offerId
    }

    const loading = await this.loadingCtrl.create();
    await loading.present();

    const res = await this.api.post("/s/acceptOffer", this.buildPayload(selectedOffer));
    await loading.dismiss();

    if (res.outcome === 'SUCCESS') {
      // this.pageCtrl.events.publish('login:setpage', 'pagesuccess', 'goshop');

      this.pageCtrl.events.publish('login:setpage',  res.applicationOutcome.applicationOutcomeNextPage);
    } else {
      this.pageCtrl.events.publish('login:setpage', 'pageresult', 'error');
    }
  }

  private buildPayload(selectedOffer: any, ): any {
    let payload = {
      acceptOffer: selectedOffer,
      applicant: {
        emailAddress: this.applicant.emailAddress,
        firstName: this.applicant.firstName,
        lastName: this.applicant.lastName,
        dob: formatDate(this.applicant.dob, 'MM/dd/yyyy', 'en-US'),
        ssn: this.applicant.ssn,
        secretCode: this.applicant.secretCode,
        income: this.applicant.income,
        addressLine1: this.applicant.addressLine1,
        addressLine2: this.applicant.addressLine2,
        city: this.applicant.city,
        zip: this.applicant.zip,
        phoneNumber: this.applicant.phoneNumber,
      },
      info: this.locationInfo
    };


    return payload;
  }
}

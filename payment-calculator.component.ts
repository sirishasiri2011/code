import { Component, OnInit, Input } from '@angular/core';
import { LoadingController, ModalController } from "@ionic/angular";

import { ApiService } from "src/app/services/api/api.service";

@Component({
  selector: 'app-payment-calculator',
  templateUrl: './payment-calculator.component.html',
  styleUrls: ['./payment-calculator.component.css']
})
export class PaymentCalculatorComponent implements OnInit {
  
  @Input()
  mobileView: boolean = false;
  
  showPaymentInfo: boolean = false;

  constructor( public loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    public api: ApiService) { }

  ngOnInit(): void {
  }
  
   public async calculatePayment(): Promise<void> {
     //Read amount from <ion-input>
    this.showPaymentInfo = false;
    let selectedAmount = this.offers.filter(c => c.checked === true);

    if (!selectedAmount) {
      alert('No Amount selected');
      return;
    }
    //build the request payload
    const request = {
    }

    const loading = await this.loadingCtrl.create();
    await loading.present();
     
    //check the api url
    const res = await this.api.post("/s/calculatePayment", this.buildPayload(selectedAmount));
    await loading.dismiss();

    if (res.outcome === 'SUCCESS') {
      this.showPaymentInfo = true;
      
    } 
     
    private buildPayload(selectedAmount: any, ): any {
    let payload = {
    };
    return payload;
  }
  }

}

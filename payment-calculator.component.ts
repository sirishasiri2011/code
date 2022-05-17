import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-payment-calculator',
  templateUrl: './payment-calculator.component.html',
  styleUrls: ['./payment-calculator.component.css']
})
export class PaymentCalculatorComponent implements OnInit {
  
  @Input()
  mobileView: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}

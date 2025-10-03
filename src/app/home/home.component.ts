import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  expanded: { metal: boolean; diamonds: boolean; head: boolean; band: boolean } = {
    metal: true,
    diamonds: true,
    head: true,
    band: true
  };

  state: any = {
    metalColor: '14k White',
    caratSize: 'One Stone',
    diamondType: 'Natural',
    basket: 'None',
    prongs: '4 Prong',
    prongTips: 'Rounded',
    prongPave: 'None',
    bandStyle: 'Round',
    cathedral: 'None',
    bandWidth: 2.0,
    ringSize: 6.0,
    fit: 'ComfortFit',
    shape: 50
  };

  toggle(key: 'metal' | 'diamonds' | 'head' | 'band') {
    this.expanded[key] = !this.expanded[key];
  }

  select(key: keyof HomeComponent['state'], value: any) {
    this.state[key] = value;
  }

  isSelected(key: keyof HomeComponent['state'], value: any): boolean {
    return this.state[key] === value;
  }
}

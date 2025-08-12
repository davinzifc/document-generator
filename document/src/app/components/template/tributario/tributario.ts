import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-tributario',
  imports: [FormsModule, TableModule, DividerModule],
  templateUrl: './tributario.html',
  styleUrl: './tributario.scss'
})
export class Tributario {

  public clientName: string = 'jane doe';
  public clientNit: string = '9999999999';
  public clientCC: string = '1018411304';
  public clientEnterpriseName: string = 'D&P Capital Inversiones SAS';

  public ciudadDelReceptor = signal('test');
  public fechaDelPago = signal('03 de diciembre de 2024');
  public conceptoDelPago = signal('Compra de USDT mediante la plataforma Binance');
  public numeroDeOrdenDeLaTransaccion = signal('22697358257253576704');
  public cantidadAdquirida = signal('4.652,38 USDT');
  public tasaDeCambioAplicada = signal('$4.310,90 COP por USDT');
  public valorTotalEnPesosColombianos = signal('$20.055.955 COP');
  public seLePracticoRetencion = signal('No');


  public tableConfig = computed(() => ({
    rows: [{
      name: 'Ciudad del receptor',
      value: this.ciudadDelReceptor()
    }, {
      name: 'Fecha del pago',
      value: this.fechaDelPago()
    },
    {
      name: 'Concepto del pago',
      value: this.conceptoDelPago()
    },
  {
    name: 'Número de orden de la transacción',
    value: this.numeroDeOrdenDeLaTransaccion()
  },
  {
    name: 'Cantidad adquirida',
    value: this.cantidadAdquirida()
  },
  {
    name: 'Tasa de cambio aplicada',
    value: this.tasaDeCambioAplicada()
  },
  {
    name: 'Valor total en pesos colombianos',
    value: this.valorTotalEnPesosColombianos()
  },
  {
    name: '¿Se le practicó alguna retención?',
    value: this.seLePracticoRetencion()
  }]
  }))


  get formattedClientName() {
    return this.clientName.toUpperCase();
  }

  get formattedClientNit() {
    return this.formatStringNumber(this.clientNit);
  }

  get formattedClientCC() {
    return this.formatStringNumber(this.clientCC);
  }

  get formattedClientEnterpriseName() {
    return this.clientEnterpriseName.toUpperCase();
  }

  public formatStringNumber(number: string): string {
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  getalgo(){
    console.log(document.getElementById("tableTributario")?.innerHTML)
  }

  

}

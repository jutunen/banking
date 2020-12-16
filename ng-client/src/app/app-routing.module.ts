import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { InitialComponent } from './initial/initial.component';
import { DepositComponent } from './deposit/deposit.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { TransferComponent } from './transfer/transfer.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { InComponent } from './in/in.component';
import { MyGuardGuard } from './my-guard.guard';

const routes: Routes = [
  { path: 'out',
    component: InitialComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      { path: '',redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  { path: '',redirectTo: 'out', pathMatch: 'full' },
  { path: 'in',
    component: InComponent,
    canActivate: [MyGuardGuard],
    children: [
      { path: 'deposit', component: DepositComponent },
      { path: 'withdraw', component: WithdrawComponent },
      { path: 'transfer', component: TransferComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: '', redirectTo: 'deposit', pathMatch: 'full'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

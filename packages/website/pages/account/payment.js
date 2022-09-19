// @ts-nocheck
/**
 * @fileoverview Account Payment Settings
 */

import { useState, useEffect } from 'react';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import PaymentCustomPlan from '../../components/account/paymentCustomPlan.js/paymentCustomPlan.js';
import PaymentTable from '../../components/account/paymentTable.js/paymentTable.js';
// import PaymentHistoryTable from 'components/account/paymentHistory.js/paymentHistory.js';
import PaymentMethodCard from '../../components/account/paymentMethodCard/paymentMethodCard.js';
import AccountPlansModal from '../../components/accountPlansModal/accountPlansModal.js';
// import PaymentHistoryTable from '../../components/account/paymentHistory.js/paymentHistory.js';
import AddPaymentMethodForm from '../../components/account/addPaymentMethodForm/addPaymentMethodForm.js';
import { plans, plansEarly } from '../../components/contexts/plansContext';
import { getSavedPaymentMethod, getUserPaymentPlan } from '../../lib/api';

const PaymentSettingsPage = props => {
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const stripePromise = loadStripe(props.stripePublishableKey);
  const [hasPaymentMethods, setHasPaymentMethods] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planSelection, setPlanSelection] = useState('');
  const [planList, setPlanList] = useState(plans);
  const [savedPaymentMethod, setSavedPaymentMethod] = useState(/** @type {PaymentMethod} */ ({}));
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(false);

  /**
   * @typedef {Object} PaymentMethodCard
   * @property {string} @type
   * @property {string} brand
   * @property {string} country
   * @property {string} exp_month
   * @property {string} exp_year
   * @property {string} last4
   */

  /**
   * @typedef {Object} PaymentMethod
   * @property {string} id
   * @property {PaymentMethodCard} card
   */

  useEffect(() => {
    const getSavedCard = async () => {
      const card = await getSavedPaymentMethod();
      if (card) {
        setSavedPaymentMethod(card.paymentMethod);
      }
      return card;
    };
    getSavedCard();
  }, [hasPaymentMethods]);

  useEffect(() => {
    if (!currentPlan || currentPlan.id === null) {
      setPlanList(plansEarly);
    } else {
      setPlanList(plans);
    }
  }, [currentPlan]);

  useEffect(() => {
    if (savedPaymentMethod) {
      const getPlan = async () => {
        const userPlan = await getUserPaymentPlan();
        if (userPlan?.subscription?.storage) {
          try {
            await setCurrentPlan(planList.find(plan => plan.id === userPlan.subscription.storage.price));
          } catch {
            throw new Error('MISSING PLAN');
          }
        } else {
          setCurrentPlan(planList.find(plan => plan.id === null));
        }
        return userPlan;
      };
      getPlan();
    }
  }, [savedPaymentMethod, planList]);

  return (
    <>
      <>
        <div className="page-container billing-container">
          <div className="">
            <h1 className="table-heading">Payment</h1>
          </div>
          <div className="billing-content">
            {currentPlan?.id === null && (
              <div className="add-billing-cta">
                <p>
                  You don&apos;t have a payment method. Please add one to prevent storage issues beyond your plan limits
                  below.
                </p>
              </div>
            )}

            <PaymentTable
              plans={planList}
              currentPlan={currentPlan}
              setPlanSelection={setPlanSelection}
              setIsPaymentPlanModalOpen={setIsPaymentPlanModalOpen}
            />

            <div className="billing-settings-layout">
              <div>
                <h4>Payment Methods</h4>
                {savedPaymentMethod && !editingPaymentMethod ? (
                  <>
                    <PaymentMethodCard
                      savedPaymentMethod={savedPaymentMethod}
                      setEditingPaymentMethod={setEditingPaymentMethod}
                    />
                  </>
                ) : (
                  <div className="add-payment-method-cta">
                    <Elements stripe={stripePromise}>
                      <ElementsConsumer>
                        {({ stripe, elements }) => (
                          <AddPaymentMethodForm
                            stripe={stripe}
                            elements={elements}
                            setHasPaymentMethods={setHasPaymentMethods}
                            setEditingPaymentMethod={setEditingPaymentMethod}
                            currentPlan={currentPlan}
                          />
                        )}
                      </ElementsConsumer>
                    </Elements>
                  </div>
                )}
              </div>

              <div className="payment-history-layout">
                <h4>Enterprise user?</h4>
                {/* <PaymentHistoryTable /> */}
                <PaymentCustomPlan />
              </div>
            </div>
          </div>

          {/* <PaymentCustomPlan /> */}
        </div>
        <AccountPlansModal
          isOpen={isPaymentPlanModalOpen}
          onClose={() => setIsPaymentPlanModalOpen(false)}
          planList={planList}
          planSelection={planSelection}
          setCurrentPlan={setCurrentPlan}
          savedPaymentMethod={savedPaymentMethod}
          stripePromise={stripePromise}
          setHasPaymentMethods={setHasPaymentMethods}
          setEditingPaymentMethod={setEditingPaymentMethod}
        />
      </>
    </>
  );
};

/**
 * @returns {{ props: import('components/types').PageAccountProps}}
 */
export function getStaticProps() {
  const STRIPE_PULISHABLE_KEY_ENVVAR_NAME = 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY';
  const stripePublishableKey = process.env[STRIPE_PULISHABLE_KEY_ENVVAR_NAME];
  if (!stripePublishableKey) {
    throw new Error(
      `account payment page missing requires truthy stripePublishableKey, but got ${stripePublishableKey}. Did you set env.${STRIPE_PULISHABLE_KEY_ENVVAR_NAME}?`
    );
  }
  return {
    props: {
      title: 'Payment',
      isRestricted: true,
      redirectTo: '/login/',
      stripePublishableKey,
    },
  };
}

export default PaymentSettingsPage;

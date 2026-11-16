// am — merged from the per-page files. This is the object the app
// consumes (flat key namespace); the page files are the source of truth.
import common from './common';
import blog from './blog';
import faq from './faq';
import category from './category';
import home from './home';
import dashboard from './dashboard';
import market from './market';
import bazaar from './bazaar';
import bazaarui from './bazaarui';
import register from './register';
import account from './account';
import store from './store';
import site from './site';
import chat from './chat';

const am = {
  ...common,
  ...blog,
  ...faq,
  ...category,
  ...home,
  ...dashboard,
  ...market,
  ...bazaar,
...bazaarui,
  ...register,
  ...account,
  ...store,
  ...site,
  ...chat,
};

export default am;

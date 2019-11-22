import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import index from '../src/widgets/index/index';
import relatedHits from '../src/widgets/related-hits/related-hits';
import configure from '../src/widgets/configure/configure';
import hits from '../src/widgets/hits/hits';
import { connectRelatedHits } from '../src/connectors';

storiesOf('Results|RelatedHits', module)
  .add(
    'default',
    withHits(({ search, container }) => {
      const productContainer = document.createElement('div');
      const relatedContainer = document.createElement('div');

      container.appendChild(productContainer);
      container.appendChild(relatedContainer);

      const relatedIndex = index({ indexName: 'instant_search' });
      let lastRelatedItem = {
        objectID: null,
      };

      search.addWidgets([
        index({ indexName: 'instant_search' }).addWidgets([
          configure({
            hitsPerPage: 1,
          }),
          hits({
            container: productContainer,
            transformItems: items => {
              const [relatedItem] = items;

              if (relatedItem.objectID === lastRelatedItem.objectID) {
                return items;
              }

              lastRelatedItem = relatedItem;

              relatedIndex.addWidgets([
                relatedHits({
                  container: relatedContainer,
                  hit: relatedItem,
                  limit: 5,
                  transformSearchParameters(searchParameters) {
                    return {
                      ...searchParameters,
                      optionalWords: relatedItem.name.split(' '),
                    };
                  },
                  matchingPatterns: {
                    brand: { score: 3 },
                    type: { score: 10 },
                    categories: { score: 2 },
                  },
                }),
              ]);

              return items;
            },
            templates: {
              item: `
<div
  class="hits-image"
  style="background-image: url({{image}})"
></div>
<article>
  <header>
    <strong>{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}</strong>
  </header>
  <p>
    {{#helpers.snippet}}{ "attribute": "description" }{{/helpers.snippet}}
  </p>
  <footer>
    <p>
      <strong>{{price}}$</strong>
    </p>
  </footer>
</article>
`,
            },
            cssClasses: {
              item: 'hits-item',
            },
          }),
        ]),
        relatedIndex,
      ]);
    })
  )
  .add(
    'connector',
    withHits(({ search, container }) => {
      const productContainer = document.createElement('div');
      const relatedContainer = document.createElement('div');

      container.appendChild(productContainer);
      container.appendChild(relatedContainer);

      const relatedIndex = index({ indexName: 'instant_search' });
      let relatedItem;

      const customRelatedHits = connectRelatedHits(
        ({ items, widgetParams, showPrevious, showNext }, isFirstRender) => {
          console.log(items, widgetParams);

          widgetParams.container.innerHTML = JSON.stringify(
            items.map(item => item.name),
            null,
            2
          );

          const previousButton = document.createElement('button');
          previousButton.textContent = 'Button';
          previousButton.addEventListener('click', () => showPrevious());

          const nextButton = document.createElement('button');
          nextButton.textContent = 'Next';
          nextButton.addEventListener('click', () => showNext());

          widgetParams.container.appendChild(previousButton);
          widgetParams.container.appendChild(nextButton);
        }
      );

      search.addWidgets([
        index({ indexName: 'instant_search' }).addWidgets([
          configure({
            hitsPerPage: 1,
          }),
          hits({
            container: productContainer,
            transformItems: items => {
              if (!relatedItem) {
                relatedItem = items[0];

                relatedIndex.addWidgets([
                  customRelatedHits({
                    container: relatedContainer,
                    hit: relatedItem,
                    limit: 5,
                    transformSearchParameters(searchParameters) {
                      return {
                        ...searchParameters,
                        optionalWords: relatedItem.name.split(' '),
                      };
                    },
                    matchingPatterns: {
                      brand: { score: 3 },
                      type: { score: 10 },
                      categories: { score: 2 },
                    },
                  }),
                ]);
              }

              return items;
            },
            templates: {
              item: `
<div
  class="hits-image"
  style="background-image: url({{image}})"
></div>
<article>
  <header>
    <strong>{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}</strong>
  </header>
  <p>
    {{#helpers.snippet}}{ "attribute": "description" }{{/helpers.snippet}}
  </p>
  <footer>
    <p>
      <strong>{{price}}$</strong>
    </p>
  </footer>
</article>
`,
            },
            cssClasses: {
              item: 'hits-item',
            },
          }),
        ]),
        relatedIndex,
      ]);
    })
  );
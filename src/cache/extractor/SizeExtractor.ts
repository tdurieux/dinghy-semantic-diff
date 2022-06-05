import AbstractCachingExtractor from './AbstractCachingExtractor.js';
import {arraySum} from '../../Util.js';
import TNode from '../../tree/TNode.js';

export default class SizeExtractor extends AbstractCachingExtractor<number> {
  protected computeValue(node: TNode): void {
    this.valueMap.set(
        node,
        1 + node.children.map(child => this.get(child)).reduce(arraySum, 0)
    );
  }
}
import {min} from 'lodash';
import {Coordinates, CollisionDetection, LayoutRect} from '@dnd-kit/core';

/**
 * Returns the distance between two points
 */
function distanceBetween(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Returns the coordinates of the center of a given ClientRect
 */
function centerOfRectangle(
  rect,
  left = rect.offsetLeft,
  top = rect.offsetTop
) {
  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5,
  };
}

const MAX_DISTANCE = 200;

export const customClosestCenter = (rects, rect) => {
  const centerRect = centerOfRectangle(rect, rect.left, rect.top);
  const distances = rects.reduce((acc, [_, rect]) => {
    const distance = distanceBetween(centerOfRectangle(rect), centerRect);
    
    // Do not match droppable if distance is greater than MAX_DISTANCE
    return distance > MAX_DISTANCE ? acc : [...acc, distance];
  }, []);

  const minValue = min(distances);
  const minValueIndex = distances.indexOf(minValue);

  return rects[minValueIndex] ? rects[minValueIndex][0] : null;
};
import java.util.NoSuchElementException;

public class SkipListSeqC<Key extends Comparable<Key>, Value> implements SkipList<Key, Value> {

  private final double P = 1 / Math.E; // Optimal P-level
  private SeqNode<Key, Value> root; // starting level 1 at smallest key. Acts as -inf
  private SeqNode<Key, Value> cap; // mirror of root that acts as +inf.
  private int n;
  private int comparisons = 0;

  public SkipListSeqC() { // initialize from a single key,value pair
    this.root = new SeqNode<Key, Value>(SeqNode.Type.root);
    this.cap = new SeqNode<Key, Value>(SeqNode.Type.cap);
    this.n = 0;
  }

  public SkipListSeqC(Key[] keys, Value[] vals) { // initialize from a list of keys and values
    this();
    this.insert(keys, vals);
  }

  public Value get(Key key) {
    return search(key).getValue();
  }

  //should we delete multiples? Should we allow for multiples at all?

  public void delete(Key key) {
    SeqNode<Key, Value> node = search(key);

    //working up linking the before and after nodes together
    for (int i = 0; i < node.nexts.size(); i++) {
      SeqNode<Key, Value> beforeNode = node.prevs.get(i);
      SeqNode<Key, Value> afterNode = node.nexts.get(i);

      beforeNode.nexts.set(i, afterNode);
      afterNode.prevs.set(i, beforeNode);
    }
    n--;
  }

  public boolean isEmpty() {
    return n == 0;
  }

  public void insert(Key[] keys, Value[] vals) {
    if (keys.length != vals.length)
      throw new IndexOutOfBoundsException("Invalid Input! keys and vals arrays must have same number of elements");
    for (int i = 0; i < keys.length; i++) {
      try {
        insert(keys[i], vals[i]);
      } catch (IllegalArgumentException e) {
      }
    }
  }

  /*
  public void insert(Key key, Value val) {

    try {
      search(key);
      return;
    } catch (NoSuchElementException e) {

      int levels = levels();

      //Adjusts height of root / terminal . Same for cap
      increaseEnds(levels);


      //creating new node
      SeqNode<Key, Value> newNode = new SeqNode<Key, Value>(key, val);

      //building new node to proper height
      for (int i = 0; i < levels; i++) {
        newNode.nexts.add(new SeqNode<Key, Value>());
        newNode.prevs.add(new SeqNode<Key, Value>());
      }

      int i = levels - 1;

      //builds of a vertical stack of nodes from top to bottom and links them forward and back progressively
      while (i >= 0) {
        SeqNode<Key, Value> backNode = root;

        //clean up conditional
        while (i < backNode.height() && backNode.nexts.get(i) != cap && backNode.nexts.get(i).isLess(newNode)) {
          backNode = backNode.nexts.get(i);
        }

        if (backNode.nexts.get(i).equals(key)) {
          throw new IllegalArgumentException("Cannot add Node with key: " + key + ". A node with key already exits");
        }

        //Setting the front node
        SeqNode<Key, Value> frontNode = cap;
        if (backNode.nexts.get(i) != null)
          frontNode = backNode.nexts.get(i);

        //linking backNode to newNode
        newNode.prevs.set(i, backNode);
        backNode.nexts.set(i, newNode);

        //linking frontNode to newNode
        frontNode.prevs.set(i, newNode);
        newNode.nexts.set(i, frontNode);

        i--;
      }
      n++;
    }
  }
*/
  public void insert(Key key, Value val) {

    int levels = levels();

    //Adjusts height of root / terminal . Same for cap
    increaseEnds(levels);

    SeqNode<Key, Value>[] backNodes = screen(key);
    if (backNodes == null)
      throw new IllegalArgumentException("Cannot add Node with key: " + key + ". A node with key already exits");


    //creating new node
    SeqNode<Key, Value> newNode = new SeqNode<Key, Value>(key, val);

    //building new node to proper height
    for (int i = 0; i < levels; i++) {
      newNode.nexts.add(new SeqNode<Key, Value>());
      newNode.prevs.add(new SeqNode<Key, Value>());
    }

    int i = levels - 1;
    System.out.println("Levels is " + levels);

    //builds of a vertical stack of nodes from top to bottom and links them forward and back progressively
    while (i >= 0) {
      SeqNode<Key, Value> backNode = backNodes[i];

      SeqNode<Key, Value> frontNode = backNodes[i].nexts.get(i);

      //linking backNode to newNode
      newNode.prevs.set(i, backNode);
      backNode.nexts.set(i, newNode);

      //linking frontNode to newNode
      frontNode.prevs.set(i, newNode);
      newNode.nexts.set(i, frontNode);

      i--;
    }
    n++;

  }

  public boolean contains(Key key) {
    try {
      search(key);
      return true;
    } catch (NoSuchElementException e) {
      return false;
    }
  }

  public int size() {
    return n;
  }

  @Override
  public String toString() {
    return root.toString();
  }

  public int getComparisons() {
    return comparisons;
  }

  public void resetComparisons() {
    comparisons = 0;
  }

  // increase size of root and cap nodes
  private void increaseEnds(int levels) {
    while (levels > root.height()) {
      root.nexts.add(new SeqNode<>());
      cap.prevs.add(new SeqNode<>());

      //linking the root and cap
      root.nexts.set(root.nexts.size() - 1, cap);
      cap.prevs.set(root.nexts.size() - 1, root);
    }
  }

  private void decreaseEnds() {
    while (root.nexts.get(root.height() - 1) == cap) {
      root.nexts.remove(root.height() - 1);
      cap.prevs.remove(root.height() - 1);
    }
  }

  //generates a number of levels for a node to have
  private int levels() {
    if (Math.random() < P)
      return 1 + levels();
    else
      return 1; // Min number is 1
  }


  /*
  private SeqNode<Key, Value> search(Key key) {
    System.out.println("This is the key in search: " + key);
    SeqNode<Key, Value> currentNode = root;
    int i = root.height() - 1;

    while (currentNode.getType() != SeqNode.Type.cap && i >= 0) {
      System.out.println("Current i level is " + i);
      System.out.println("This is the key in search: " + key);
      System.out.println("currentNode has key = " + currentNode.getKey());
      System.out.println("currentNode.nexts.get(i) has key = " + currentNode.nexts.get(i).getKey());
      if (currentNode.nexts.get(i).isLess(key)) { //most common case
        currentNode = currentNode.nexts.get(i);
        comparisons++;
        System.out.println("Search branch 1");
      } else if (currentNode.nexts.get(i).equals(key)) {
        comparisons++; //needed here?
        System.out.println("Search branch 2");
        return currentNode.nexts.get(i);
      } else { // if !(currentNode.nexts.get(i).isLess(key)) then go down a level
        comparisons++;
        System.out.println("Search branch 3");
        i--;
      }
    }
    throw new NoSuchElementException("No Value for key:" + key);
  } */

  private SeqNode<Key, Value> search(Key key) {

    SeqNode<Key, Value> currentNode = root;
    int i = root.height() - 1;

    while (currentNode.getType() != SeqNode.Type.cap && i >= 0) {

      if (currentNode.nexts.get(i).isLess(key)) { //most common case
        currentNode = currentNode.nexts.get(i);
        comparisons++;

      } else if (currentNode.nexts.get(i).equals(key)) {
        comparisons++; //needed here?

        return currentNode.nexts.get(i);
      } else { // if !(currentNode.nexts.get(i).isLess(key)) then go down a level
        comparisons++;

        i--;
      }
    }
    throw new NoSuchElementException("No Value for key:" + key);
  }

  //finds the backNodes necessary for an insertion
  private SeqNode<Key, Value>[] screen(Key key) {

    SeqNode<Key, Value>[] backNodes = new SeqNode[root.height()];
    SeqNode<Key, Value> currentNode = root;
    int i = root.height() - 1;

    while (currentNode.getType() != SeqNode.Type.cap && i >= 0) {
      if (currentNode.nexts.get(i).isLess(key)) { //most common case
        currentNode = currentNode.nexts.get(i);

      } else if (currentNode.nexts.get(i).equals(key)) {
        return null;
      } else { // if !(currentNode.nexts.get(i).isLess(key)) then go down a level
        backNodes[i] = currentNode;
        i--;
      }
    }
    return backNodes;
  }


}

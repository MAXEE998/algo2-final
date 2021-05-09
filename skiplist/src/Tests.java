import java.util.HashMap;
import java.util.NoSuchElementException;

public class Tests {

  private static class Log {
    public void print(String test, long time, String units) {
      System.out.println(String.format("%s: %d%s", test, time, units));// nano seconds
    }
  }

  private static class Record {
    HashMap<String, Long> hm;

    public Record() {
      this.hm = new HashMap<String, Long>();
    }

    public int size() {
      return hm.size();
    }

    public long avg() {
      long sum = hm.values().stream().mapToLong(val -> val).sum();
      return sum / this.size();
    }

    public void add(String test, long result) {
      hm.put(test, result);
    }
  }

  public static void test(int n) {
    System.out.println("\n%%%%%%%%%%%%Test with " + n + " elements%%%%%%%%%%%%");
    Log log = new Log();
    Integer[] keys = new Integer[n];
    String[] vals = new String[n];

    for (int i = 0; i < n; i++) {
      int key = (int) (Math.random() * 100);
      keys[i] = key;
      vals[i] = "TEST#" + key;
    }
    long startTime;
    long endTime;


    // Initialization
    startTime = System.nanoTime();
    SkipListSeqC<Integer, String> seqSl = new SkipListSeqC<>(keys, vals);
    endTime = System.nanoTime();
    log.print("Sequential Initialization", (endTime - startTime), "ns");

    System.out.println(seqSl);

    startTime = System.nanoTime();
    SkipListLinkedC<Integer, String> linkedSl = new SkipListLinkedC<>(keys, vals);
    endTime = System.nanoTime();
    log.print("Linked Initialization", (endTime - startTime), "ns");
    // Initialization End

    // Get
    Record seqGetRecord = new Record();
    for (int i = 0; i < seqSl.size(); i++) {
      startTime = System.nanoTime();
      System.out.println("\n\nAbout to search for this key: " + keys[i]);
      String val = seqSl.get(keys[i]);
      endTime = System.nanoTime();
      seqGetRecord.add("Get Test:" + i, endTime - startTime);
      assert (val.equals(vals[i]));

    }
    log.print("Sequential GET", seqGetRecord.avg(), "ns");


    /*
    Record linkedGetRecord = new Record();
    for (int i = 0; i < linkedSl.size(); i++) {
      startTime = System.nanoTime();
      String val = linkedSl.get(keys[i]);
      endTime = System.nanoTime();
      linkedGetRecord.add("Get Test:" + i, endTime - startTime);
      assert (val.equals(vals[i]));

    }
    log.print("Linked GET", linkedGetRecord.avg(), "ns");
    // Get End */

    //Delete
    Record seqDeleteRecord = new Record();
    for (int i = 0; i < seqSl.size(); i++) {
      startTime = System.nanoTime();
      try {
        seqSl.delete(keys[i]);
      } catch (NoSuchElementException e) {
      }
      endTime = System.nanoTime();
      seqDeleteRecord.add("Get Test:" + i, endTime - startTime);
    }
    log.print("Sequential DELETE", seqDeleteRecord.avg(), "ns");


    /*
    Record linkedDeleteRecord = new Record();
    for (int i = 0; i < linkedSl.size(); i++) {
      startTime = System.nanoTime();
      try {
        linkedSl.delete(keys[i]);
      } catch (NoSuchElementException e) {
      }
      endTime = System.nanoTime();
      linkedDeleteRecord.add("Get Test:" + i, endTime - startTime);

    } *
    log.print("Linked DELETE", linkedDeleteRecord.avg(), "ns");
*/
    assert (seqSl.size() == linkedSl.size() && linkedSl.size() == 0);
    //Delete End

  }


  public static void main(String[] args) {
    test(1000); //1000 elements


  }
}
